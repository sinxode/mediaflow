// Task Service Layer Adapter
// Connects directly to the live Supabase database.

import { supabase } from '../../lib/supabaseClient';
import { ActivityService } from '../activity/activityService';
import { isValidTransition } from '../workflow/workflowService';

export const TaskService = {
  getTasks: async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, assignee:users!assigned_to(name, role), creator:users!created_by(name, role)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getTaskById: async (id) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, assignee:users!assigned_to(name, role), creator:users!created_by(name, role)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  createTask: async (taskData) => {
    if (!taskData.title || taskData.title.trim().length < 3) {
      throw new Error('Task title must be at least 3 characters.');
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();
    if (error) throw error;

    const currentUserId = taskData.created_by || (await supabase.auth.getSession().then(({ data: { session } }) => session?.user?.id)) || null;

    await ActivityService.logActivity(
      'task_created',
      data.id,
      currentUserId,
      { taskTitle: data.title }
    );

    return data;
  },

  updateTask: async (id, updateData) => {
    const { data: previous } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (previous && updateData.status && updateData.status !== previous.status) {
      const allowed = isValidTransition(previous.status, updateData.status, updateData.description || previous.description);
      if (!allowed) {
        throw new Error(`Unauthorized status transition from ${previous.status} to ${updateData.status}.`);
      }
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select('*, assignee:users!assigned_to(name, role), creator:users!created_by(name, role)')
      .single();
    if (error) throw error;

    if (previous) {
      const sessionUser = await supabase.auth.getSession().then(({ data: { session } }) => session?.user?.id) || null;

      if (updateData.status && updateData.status !== previous.status) {
        await ActivityService.logActivity(
          'status_changed',
          id,
          sessionUser,
          { taskTitle: data.title, previousStatus: previous.status, newStatus: updateData.status }
        );
      }
      if (updateData.assigned_to && updateData.assigned_to !== previous.assigned_to) {
        await ActivityService.logActivity(
          'task_assigned',
          id,
          sessionUser,
          { taskTitle: data.title, newAssignee: updateData.assigned_to }
        );
      }
      if (updateData.file_url && updateData.file_url !== previous.file_url) {
        const action = previous.file_url ? 'file_replaced' : 'file_uploaded';
        await ActivityService.logActivity(
          action,
          id,
          sessionUser,
          { taskTitle: data.title, fileName: updateData.file_name }
        );
      }
    }

    return data;
  },

  deleteTask: async (id) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

export default TaskService;
