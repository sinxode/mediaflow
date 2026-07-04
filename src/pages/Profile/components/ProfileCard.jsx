import React from 'react';
import Card from '../../../components/Card/Card';
import Avatar from '../../../components/Avatar/Avatar';
import styles from './ProfileCard.module.scss';

const ProfileCard = ({ user }) => {
  return (
    <Card padding={true} className={styles.profileCard}>
      <div className={styles.cardContent}>
        {/* Avatar Area */}
        <div className={styles.avatarWrapper}>
          <Avatar src={user.avatarUrl} name={user.name} size="lg" className={styles.profileAvatar} />
          <span className={styles.statusDot} />
        </div>

        {/* Text Area */}
        <div className={styles.userInfo}>
          <h2 className={styles.userName}>{user.name}</h2>
          <span className={styles.userRole}>{user.role}</span>
          <span className={styles.userEmail}>{user.email}</span>
          <span className={styles.memberSince}>Joined {user.joinedDate}</span>
        </div>
      </div>
    </Card>
  );
};

export default ProfileCard;
