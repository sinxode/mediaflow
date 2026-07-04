import React from 'react';
import styles from './EmptyState.module.scss';
import Card from '../Card/Card';

const EmptyState = ({
  title,
  description,
  action = null,
  icon = null,
  className = '',
  ...props
}) => {
  return (
    <Card className={`${styles.emptyState} ${className}`} padding={true} {...props}>
      <div className={styles.container}>
        {icon && <div className={styles.iconWrapper}>{icon}</div>}
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
        {action && <div className={styles.action}>{action}</div>}
      </div>
    </Card>
  );
};

export default EmptyState;
