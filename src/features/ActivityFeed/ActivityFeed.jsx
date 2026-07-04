import React from 'react';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Card from '../../components/Card/Card';
import styles from './ActivityFeed.module.scss';

const ActivityFeed = ({ activities = [], className = '' }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'publish':
        return <CheckCircle className={styles.iconPublish} />;
      case 'review':
        return <Clock className={styles.iconReview} />;
      case 'create':
        return <FileText className={styles.iconCreate} />;
      default:
        return <AlertCircle className={styles.iconDefault} />;
    }
  };

  return (
    <Card className={`${styles.feedCard} ${className}`} padding={true}>
      <h3 className={styles.title}>Recent Activity</h3>
      <div className={styles.feedList}>
        {activities.map((activity) => (
          <div key={activity.id} className={styles.feedItem}>
            <div className={styles.timeline}>
              <div className={styles.dotWrapper}>{getIcon(activity.type)}</div>
              <div className={styles.line} />
            </div>
            <div className={styles.content}>
              <p className={styles.text}>
                <span className={styles.user}>{activity.user}</span> {activity.action}{' '}
                <span className={styles.target}>{activity.target}</span>
              </p>
              <span className={styles.time}>{activity.time}</span>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className={styles.empty}>No recent activity</div>
        )}
      </div>
    </Card>
  );
};

export default ActivityFeed;
