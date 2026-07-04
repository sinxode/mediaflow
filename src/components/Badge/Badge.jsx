import React from 'react';
import styles from './Badge.module.scss';

const Badge = ({
  children,
  variant = 'secondary', // 'primary' | 'success' | 'warning' | 'danger' | 'review' | 'secondary'
  className = '',
  ...props
}) => {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
