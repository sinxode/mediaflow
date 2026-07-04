import React from 'react';
import Card from '../Card/Card';
import styles from './MetricCard.module.scss';

const MetricCard = ({ title, value, description, trend, icon }) => {
  return (
    <Card className={styles.metricCard}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {icon && <span className={styles.iconWrapper}>{icon}</span>}
      </div>
      
      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {trend && <span className={styles.trendBadge}>{trend}</span>}
      </div>
      
      {description && <p className={styles.description}>{description}</p>}
    </Card>
  );
};

export default MetricCard;
