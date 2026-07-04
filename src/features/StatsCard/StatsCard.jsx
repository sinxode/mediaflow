import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../../components/Card/Card';
import styles from './StatsCard.module.scss';

const StatsCard = ({
  title,
  value,
  icon = null,
  trend = null, // { type: 'up' | 'down', value: '12%' }
  description = null,
  className = '',
  ...props
}) => {
  return (
    <Card className={`${styles.statsCard} ${className}`} padding={true} {...props}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {icon && <div className={styles.iconWrapper}>{icon}</div>}
      </div>

      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        {trend && (
          <div className={`${styles.trend} ${styles[trend.type]}`}>
            {trend.type === 'up' ? <ArrowUpRight /> : <ArrowDownRight />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {description && <p className={styles.description}>{description}</p>}
    </Card>
  );
};

export default StatsCard;
