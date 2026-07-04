import React from 'react';
import Card from '../Card/Card';
import styles from './CategoryInsights.module.scss';

const CategoryInsights = ({ categories = [] }) => {
  return (
    <Card className={styles.panelCard}>
      <h3 className={styles.title}>Asset Category Distribution</h3>
      <p className={styles.subtitle}>Volume statistics grouped by workflow category types.</p>

      <div className={styles.categoryGrid}>
        {categories.map((cat) => {
          const total = cat.created || 0;
          const completedAndPublished = cat.completed + cat.published;
          const completionRate = total > 0 ? Math.round((completedAndPublished / total) * 100) : 0;

          return (
            <div key={cat.name} className={styles.catCell}>
              <div className={styles.cellHeader}>
                <span className={styles.catName}>{cat.name}</span>
                <span className={styles.rateText}>{completionRate}% Done</span>
              </div>
              
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${completionRate}%` }} />
              </div>
              
              <div className={styles.detailsRow}>
                <span>{cat.pending} Pending</span>
                <span>•</span>
                <span>{completedAndPublished} Finished</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default CategoryInsights;
