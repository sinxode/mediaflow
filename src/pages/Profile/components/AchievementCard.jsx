import React from 'react';
import { Award, Zap, Shield, Flame } from 'lucide-react';
import Card from '../../../components/Card/Card';
import styles from './AchievementCard.module.scss';

const AchievementCard = ({ achievements = [] }) => {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'zap': return <Zap className={styles.iconZap} />;
      case 'shield': return <Shield className={styles.iconShield} />;
      case 'flame': return <Flame className={styles.iconFlame} />;
      default: return <Award className={styles.iconAward} />;
    }
  };

  return (
    <Card padding={true} className={styles.achievementsCard}>
      <h3 className={styles.title}>Milestones & Achievements</h3>
      
      <div className={styles.grid}>
        {achievements.map((item) => (
          <div key={item.title} className={styles.itemCard}>
            <div className={styles.iconWrapper}>{getIcon(item.icon)}</div>
            <div className={styles.info}>
              <h4 className={styles.itemTitle}>{item.title}</h4>
              <p className={styles.itemDescription}>{item.description}</p>
              <span className={styles.date}>{item.unlockedDate}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AchievementCard;
