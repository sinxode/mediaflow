import React from 'react';
import { Eye, CheckCircle, Edit3, Globe, Sparkles } from 'lucide-react';
import Card from '../../../components/Card/Card';
import Avatar from '../../../components/Avatar/Avatar';
import styles from './ReviewActivityFeed.module.scss';

const ReviewActivityFeed = ({ activities = [], metrics }) => {
  const getIcon = (action) => {
    const act = action.toLowerCase();
    if (act.includes('approved')) return <CheckCircle className={styles.iconApproved} />;
    if (act.includes('changes')) return <Edit3 className={styles.iconChanges} />;
    if (act.includes('published')) return <Globe className={styles.iconPublished} />;
    return <Eye className={styles.iconDefault} />;
  };

  const metricCards = [
    { label: 'Reviewed Today', value: metrics.reviewedToday, color: 'primary' },
    { label: 'Approved Today', value: metrics.approvedToday, color: 'success' },
    { label: 'Changes Req.', value: metrics.changesRequestedToday, color: 'warning' },
    { label: 'Published Today', value: metrics.publishedToday, color: 'review' }
  ];

  return (
    <div className={styles.container}>
      {/* Productivity Insight Grid */}
      <div className={styles.insightsSection}>
        <h3 className={styles.sectionTitle}>Insights Panel</h3>
        <div className={styles.insightsGrid}>
          {metricCards.map((card) => (
            <Card key={card.label} variant="surface" padding={false} className={styles.insightCard}>
              <div className={`${styles.bar} ${styles[card.color]}`} />
              <div className={styles.insightContent}>
                <span className={styles.insightValue}>{card.value}</span>
                <span className={styles.insightLabel}>{card.label}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Review Activity Feed */}
      <Card padding={true} className={styles.activityCard}>
        <div className={styles.activityHeader}>
          <Sparkles className={styles.sparkleIcon} />
          <h3 className={styles.sectionTitleInside}>Recent Reviews</h3>
        </div>

        <div className={styles.timeline}>
          {activities.map((activity) => (
            <div key={activity.id} className={styles.timelineItem}>
              <div className={styles.indicatorCol}>
                <Avatar name={activity.user} size="sm" />
                <div className={styles.timelineLine} />
              </div>
              <div className={styles.contentCol}>
                <p className={styles.timelineText}>
                  <strong className={styles.user}>{activity.user}</strong>{' '}
                  {activity.action}{' '}
                  <span className={styles.target}>{activity.target}</span>
                </p>
                <span className={styles.time}>{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ReviewActivityFeed;
