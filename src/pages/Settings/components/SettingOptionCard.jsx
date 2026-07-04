import React from 'react';
import styles from './SettingOptionCard.module.scss';

const SettingOptionCard = ({ value, onChange }) => {
  const options = [
    { id: 'light', label: 'Light Mode', desc: 'Standard white theme' },
    { id: 'dark', label: 'Dark Mode', desc: 'Sleek dark theme' },
    { id: 'system', label: 'System Mode', desc: 'Sync with OS settings' }
  ];

  return (
    <div className={styles.optionsContainer}>
      <span className={styles.sectionLabel}>Appearance Theme</span>
      <div className={styles.grid}>
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`${styles.optionCard} ${isSelected ? styles.selected : ''}`}
            >
              {/* Mini theme preview layout mock */}
              <div className={`${styles.previewBox} ${styles[opt.id]}`}>
                <div className={styles.previewSidebar} />
                <div className={styles.previewContent}>
                  <div className={styles.previewHeader} />
                  <div className={styles.previewLine} />
                  <div className={styles.previewLineShort} />
                </div>
              </div>
              
              <div className={styles.meta}>
                <span className={styles.label}>{opt.label}</span>
                <span className={styles.desc}>{opt.desc}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SettingOptionCard;
