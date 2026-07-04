import React from 'react';
import styles from './LoadingSkeleton.module.scss';

const LoadingSkeleton = ({
  variant = 'text', // 'text' | 'title' | 'circle' | 'rectangle'
  width,
  height,
  className = '',
  ...props
}) => {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={style}
      {...props}
    />
  );
};

export default LoadingSkeleton;
