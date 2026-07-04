import React from 'react';
import { PlusCircle, Eye, Globe, CheckCircle } from 'lucide-react';
import Card from '../../../components/Card/Card';
import styles from './ActivityTimeline.module.scss';

const ActivityTimeline = ({ activities = [] }) => {
  const getIcon = (action) => {
    const act = action.toLowerCase();
    if (act.includes('created')) return <PlusCircle className={styles.iconCreated} />;
    if (act.includes('approved')) return <Eye className={styles.iconApproved} />;
    if (act.includes('published')) return <Globe className={styles.iconPublished} />;
    if (act.includes('completed')) return <CheckCircle className={styles.iconCompleted} />;
    return <CheckCircle className={styles.iconDefault} />;
  };

  return (
    <Card padding={true} className={styles.timelineCard}>
      <h3 className={styles.title}>Recent Activity</h3>
      
      <div className={styles.timeline}>
        {activities.map((activity, index) => (
          <div key={activity.id || index} className={styles.timelineItem}>
            <div className={styles.iconCol}>
              <div className={styles.iconWrapper}>{getIcon(activity.action)}</div>
              <div className={styles.line} />
            </div>
            
            <div className={styles.contentCol}>
              <p className={styles.activityText}>
                <span className={styles.action}>{activity.action}</span>{' '}
                <strong className={styles.target}>{activity.target}</strong>
              </p>
              <span className={styles.time}>{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActivityTimeline;
