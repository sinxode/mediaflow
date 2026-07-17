import React from 'react';
import { RefreshCw, Play, Calendar, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { getScheduleOccurrences, getGenerationTargetDateTime } from '../../services/workflows/schedulerEngine';
import styles from './RecurringWorkflows.module.scss';

// CSS modules styling embedded locally or imported
const widgetStyles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    width: '100%',
    marginBottom: '24px'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  iconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  details: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  value: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: '1.2',
    marginTop: '2px'
  }
};

const WorkflowsDashboardWidget = ({ workflows = [], monthlyGenerated = 0, failedGenerations = 0 }) => {
  const activeCount = workflows.filter((w) => w.status === 'active').length;
  
  // Calculate upcoming occurrences in the next 7 days
  const now = new Date();
  const next7Days = new Date();
  next7Days.setDate(now.getDate() + 7);
  
  let upcomingCount = 0;
  
  workflows.forEach((workflow) => {
    if (workflow.status !== 'active') return;
    try {
      // Look for occurrences between today and next 7 days
      const occurrences = getScheduleOccurrences(workflow, now, next7Days);
      occurrences.forEach((eventDate) => {
        const genTarget = getGenerationTargetDateTime(
          eventDate, 
          workflow.generation_offset, 
          workflow.generation_time
        );
        // Only count if it's upcoming (generation target is in the future)
        if (genTarget > now) {
          upcomingCount++;
        }
      });
    } catch (e) {
      console.error(e);
    }
  });

  const cards = [
    {
      label: 'Active Workflows',
      value: activeCount,
      color: '#EEF2FF',
      iconColor: '#4F46E5',
      icon: <Play size={20} />
    },
    {
      label: 'Upcoming Generations',
      value: upcomingCount,
      color: '#F5F3FF',
      iconColor: '#7C3AED', // Lavender theme accent
      icon: <Calendar size={20} />
    },
    {
      label: 'Generated This Month',
      value: monthlyGenerated,
      color: '#ECFDF5',
      iconColor: '#10B981',
      icon: <RefreshCw size={18} />
    },
    {
      label: 'Failed Runs',
      value: failedGenerations,
      color: failedGenerations > 0 ? '#FEF2F2' : '#F8FAFC',
      iconColor: failedGenerations > 0 ? '#EF4444' : '#94A3B8',
      icon: <AlertTriangle size={20} />
    }
  ];

  return (
    <div style={widgetStyles.container}>
      {cards.map((card, idx) => (
        <div key={idx} style={widgetStyles.card}>
          <div 
            style={{ 
              ...widgetStyles.iconBox, 
              backgroundColor: card.color, 
              color: card.iconColor 
            }}
          >
            {card.icon}
          </div>
          <div style={widgetStyles.details}>
            <span style={widgetStyles.label}>{card.label}</span>
            <span style={widgetStyles.value}>{card.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkflowsDashboardWidget;
