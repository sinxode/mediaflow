import React from 'react';
import styles from './SettingToggle.module.scss';

const SettingToggle = ({ label, description, checked, onChange }) => {
  return (
    <div className={styles.toggleRow} onClick={() => onChange(!checked)}>
      <div className={styles.infoCol}>
        <span className={styles.toggleLabel}>{label}</span>
        {description && <p className={styles.toggleDescription}>{description}</p>}
      </div>

      <div className={`${styles.switch} ${checked ? styles.checked : ''}`}>
        <div className={styles.handle} />
      </div>
    </div>
  );
};

export default SettingToggle;
