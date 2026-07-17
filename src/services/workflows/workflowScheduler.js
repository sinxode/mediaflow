// Recurring Workflow Task Scheduler & generator
// Integrates with TaskService and supabase notifications schema.

import { supabase } from '../../lib/supabaseClient';
import { TaskService } from '../tasks/taskService';
import { getScheduleOccurrences, getGenerationTargetDateTime, parseDynamicTemplate } from './schedulerEngine';

export const WorkflowScheduler = {
  checkAndGenerateTasks: async () => {
    const now = new Date();
    
    // Fetch all active recurring workflows
    const { data: workflows, error } = await supabase
      .from('recurring_workflows')
      .select('*')
      .eq('status', 'active');
      
    if (error) {
      console.error('Failed to fetch recurring workflows for scheduler', error);
      return { success: false, error };
    }
    
    const results = [];

    for (const workflow of workflows) {
      try {
        // Range to look for occurrences: from 14 days ago to 7 days in the future
        const startRange = new Date();
        startRange.setDate(now.getDate() - 14);
        const endRange = new Date();
        endRange.setDate(now.getDate() + 7);
        
        const occurrences = getScheduleOccurrences(workflow, startRange, endRange);
        
        for (const eventDate of occurrences) {
          const formattedEventDate = eventDate.toISOString().split('T')[0];
          
          // Calculate when this task should be generated
          const targetGenDateTime = getGenerationTargetDateTime(
            eventDate, 
            workflow.generation_offset, 
            workflow.generation_time
          );
          
          // If the generation time has arrived/passed (i.e. targetGenDateTime <= now)
          if (targetGenDateTime <= now) {
            
            // Check if this occurrence was already processed (either success, skipped, or failed)
            const { data: existingHistory } = await supabase
              .from('workflow_history')
              .select('id')
              .eq('workflow_id', workflow.id)
              .eq('scheduled_event_date', formattedEventDate)
              .maybeSingle();
              
            if (existingHistory) {
              continue;
            }
            
            // Generate Task!
            const parsedTitle = parseDynamicTemplate(workflow.task_title_template, eventDate);
            let parsedDescription = parseDynamicTemplate(workflow.task_description_template, eventDate);
            
            // Append checklist items in description
            if (workflow.checklist && workflow.checklist.length > 0) {
              parsedDescription += '\n\n### Checklist:\n' + workflow.checklist.map(item => `[ ] ${item}`).join('\n');
            }
            
            // Append default workflow tag metadata so it triggers normal MediaFlow stages
            parsedDescription += `\n\n[workflow:review=true;publishing=true;deliverable=true]`;
            
            const taskPayload = {
              title: parsedTitle,
              description: parsedDescription,
              category: workflow.category,
              priority: workflow.priority.toLowerCase(),
              status: 'created', // starts at created
              assigned_to: workflow.assigned_to || null,
              created_by: workflow.created_by,
              deadline: formattedEventDate // event date acts as deadline
            };
            
            try {
              // 1. Insert generated task
              const generatedTask = await TaskService.createTask(taskPayload);
              
              // 2. Link created task to workflow history log
              await supabase
                .from('workflow_history')
                .insert({
                  workflow_id: workflow.id,
                  scheduled_event_date: formattedEventDate,
                  generated_task_id: generatedTask.id,
                  assigned_to: workflow.assigned_to || null,
                  status: 'success'
                });
                
              // 3. Dispatch in-app notification to the assigned user
              if (workflow.assigned_to) {
                await supabase.from('notifications').insert({
                  user_id: workflow.assigned_to,
                  type: 'workflow_update',
                  category: 'workflow_update',
                  title: '🔔 New Recurring Task',
                  message: `Task "${parsedTitle}" has been generated automatically for event on ${formattedEventDate}.`,
                  related_task_id: generatedTask.id,
                  is_read: false
                });
              }
              
              results.push({ workflowName: workflow.name, eventDate: formattedEventDate, status: 'success' });
              
            } catch (dbError) {
              // Handle unique key constraint (idempotency race condition)
              if (dbError.code === '23505') { 
                console.log(`Duplicate prevention caught. Skipped generating ${workflow.name} for ${formattedEventDate}`);
                results.push({ workflowName: workflow.name, eventDate: formattedEventDate, status: 'skipped' });
              } else {
                console.error(`Failed to generate task for ${workflow.name} on ${formattedEventDate}`, dbError);
                
                await supabase
                  .from('workflow_history')
                  .insert({
                    workflow_id: workflow.id,
                    scheduled_event_date: formattedEventDate,
                    status: 'failed',
                    error_message: dbError.message || 'Database execution error'
                  });
                  
                results.push({ workflowName: workflow.name, eventDate: formattedEventDate, status: 'failed', error: dbError });
              }
            }
          }
        }
      } catch (err) {
        console.error(`Scheduler error for workflow: ${workflow.name}`, err);
      }
    }
    
    return { success: true, results };
  }
};

export default WorkflowScheduler;
