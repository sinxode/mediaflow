import React from 'react';
import styles from './RoleBadge.module.scss';

const RoleBadge = ({ role }) => {
  if (!role) return null;
  const isCreator = role.toLowerCase() === 'creator';

  return (
    <span className={`${styles.badge} ${isCreator ? styles.creator : styles.reviewer}`}>
      {isCreator ? 'Creator' : 'Reviewer'}
    </span>
  );
};

export default RoleBadge;
