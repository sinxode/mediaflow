import React, { useState } from 'react';
import styles from './Avatar.module.scss';

const Avatar = ({
  src,
  name = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);
  const showFallback = !src || hasError;

  return (
    <div
      className={`${styles.avatar} ${styles[size]} ${className}`}
      title={name}
      {...props}
    >
      {showFallback ? (
        <span className={styles.initials}>{initials}</span>
      ) : (
        <img
          src={src}
          alt={name}
          onError={() => setHasError(true)}
          className={styles.image}
        />
      )}
    </div>
  );
};

export default Avatar;
