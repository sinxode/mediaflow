import React from 'react';
import { motion } from 'framer-motion';
import styles from './ReviewTabs.module.scss';

const ReviewTabs = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'ready-for-review', label: 'Ready For Review' },
    { id: 'changes-requested', label: 'Changes Requested' },
    { id: 'approved', label: 'Approved' },
    { id: 'ready-to-publish', label: 'Ready To Publish' },
    { id: 'completed', label: 'Completed Today' }
  ];

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabsScroll}>
        <div className={styles.tabsList}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`${styles.tabBtn} ${isActive ? styles.activeTab : ''}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeReviewTabBg"
                    className={styles.activeBg}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={styles.tabText}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewTabs;
