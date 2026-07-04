import React from 'react';
import { Award, Target, Sparkles, BookOpen, Clock } from 'lucide-react';
import Card from '../../../components/Card/Card';
import Avatar from '../../../components/Avatar/Avatar';
import styles from './ArchiveActivityFeed.module.scss';

const ArchiveActivityFeed = ({ activities = [], insights }) => {
  const insightCards = [
    { label: 'Top Creator', value: insights.activeCreator, icon: <Target />, color: 'primary' },
    { label: 'Top Reviewer', value: insights.activeReviewer, icon: <Award />, color: 'success' },
    { label: 'Top Category', value: insights.topCategory, icon: <BookOpen />, color: 'review' },
    { label: 'Avg Lead Time', value: insights.avgTime, icon: <Clock />, color: 'warning' }
  ];

  return (
    <div className={styles.container}>
      {/* Archive Insights Grid */}
      <div className={styles.insightsSection}>
        <h3 className={styles.sectionTitle}>Archive Insights</h3>
        <div className={styles.insightsGrid}>
          {insightCards.map((card) => (
            <Card key={card.label} variant="surface" padding={false} className={styles.insightCard}>
              <div className={`${styles.bar} ${styles[card.color]}`} />
              <div className={styles.insightContent}>
                <span className={styles.insightValue}>{card.value}</span>
                <span className={styles.insightLabel}>{card.label}</span>
              </div>
              <div className={styles.insightIcon}>{card.icon}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Publishing Feed */}
      <Card padding={true} className={styles.activityCard}>
        <div className={styles.activityHeader}>
          <Sparkles className={styles.sparkleIcon} />
          <h3 className={styles.sectionTitleInside}>Recent Releases</h3>
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

export default ArchiveActivityFeed;
