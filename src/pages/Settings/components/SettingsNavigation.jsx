import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Bell, RefreshCw, User, Shield, Info } from 'lucide-react';
import styles from './SettingsNavigation.module.scss';

const SettingsNavigation = ({ activeTab, onChangeTab }) => {
  const navItems = [
    { id: 'notifications', label: 'Notifications', icon: <Bell /> },
    { id: 'account', label: 'Account Settings', icon: <User /> },
    { id: 'security', label: 'Security', icon: <Shield /> },
    { id: 'about', label: 'About App', icon: <Info /> }
  ];

  return (
    <div className={styles.navigationWrapper}>
      {/* Mobile Horizontal scroll bar */}
      <div className={styles.mobileNavScroll}>
        <div className={styles.mobileNavList}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                className={`${styles.mobileBtn} ${isActive ? styles.mobileActive : ''}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSettingsMobileTabBg"
                    className={styles.mobileActiveBg}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={styles.btnIcon}>{item.icon}</span>
                <span className={styles.btnText}>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Vertical Menu */}
      <div className={styles.desktopMenu}>
        <h3 className={styles.menuTitle}>Configuration</h3>
        <div className={styles.menuList}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                className={`${styles.desktopBtn} ${isActive ? styles.desktopActive : ''}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSettingsDesktopTabBg"
                    className={styles.desktopActiveBg}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <div className={styles.desktopBtnContent}>
                  <span className={styles.desktopIcon}>{item.icon}</span>
                  <span className={styles.desktopText}>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingsNavigation;
