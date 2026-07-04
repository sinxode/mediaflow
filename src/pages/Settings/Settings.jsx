import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/PageHeader/PageHeader';
import Card from '../../components/Card/Card';
import SettingsNavigation from './components/SettingsNavigation';
import SettingToggle from './components/SettingToggle';
import SettingOptionCard from './components/SettingOptionCard';
import AccountCard from './components/AccountCard';
import SecurityCard from './components/SecurityCard';
import AboutCard from './components/AboutCard';
import { useAuth } from '../../auth/hooks/useAuth';
import { pageVariants } from '../../utils/animations';
import styles from './Settings.module.scss';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');

  // Preferences state - initialized from localStorage caching
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mediaflow_theme') || 'system';
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('mediaflow_notifications');
      return saved ? JSON.parse(saved) : {
        assigned: true,
        review: true,
        approved: false,
        published: true,
        comments: true
      };
    } catch {
      return {
        assigned: true,
        review: true,
        approved: false,
        published: true,
        comments: true
      };
    }
  });

  const [workflow, setWorkflow] = useState(() => {
    try {
      const saved = localStorage.getItem('mediaflow_workflow');
      return saved ? JSON.parse(saved) : {
        defaultView: 'Dashboard',
        density: 'Compact Mode',
        layoutStyle: 'Card list'
      };
    } catch {
      return {
        defaultView: 'Dashboard',
        density: 'Compact Mode',
        layoutStyle: 'Card list'
      };
    }
  });

  // Sync updates to localStorage
  useEffect(() => {
    localStorage.setItem('mediaflow_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('mediaflow_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('mediaflow_workflow', JSON.stringify(workflow));
  }, [workflow]);

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleWorkflowChange = (key, val) => {
    setWorkflow((prev) => ({ ...prev, [key]: val }));
  };

  // Render active category section content
  const renderActiveSection = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.sectionContent}
          >
            <Card padding={true} className={styles.settingsCard}>
              <h3 className={styles.sectionTitle}>Notification Preferences</h3>
              <p className={styles.sectionDesc}>Choose when you want to receive system and desktop alerts.</p>
              
              <div className={styles.togglesList}>
                <SettingToggle
                  label="Task Assigned"
                  description="Receive an alert when a media workflow task is assigned to you."
                  checked={notifications.assigned}
                  onChange={() => handleNotificationToggle('assigned')}
                />
                <SettingToggle
                  label="Review Requested"
                  description="Receive an alert when a creator submits a draft asset for review."
                  checked={notifications.review}
                  onChange={() => handleNotificationToggle('review')}
                />
                <SettingToggle
                  label="Task Approved"
                  description="Receive an alert when your submitted media asset is approved."
                  checked={notifications.approved}
                  onChange={() => handleNotificationToggle('approved')}
                />
                <SettingToggle
                  label="Task Published"
                  description="Receive an alert when a reviewer marks an asset as published."
                  checked={notifications.published}
                  onChange={() => handleNotificationToggle('published')}
                />
                <SettingToggle
                  label="New Comments"
                  description="Receive an alert when a crew member writes a comment on your task thread."
                  checked={notifications.comments}
                  onChange={() => handleNotificationToggle('comments')}
                />
              </div>
            </Card>
          </motion.div>
        );

      case 'account':
        return (
          <motion.div
            key="account"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.sectionContent}
          >
            <AccountCard user={user || { name: 'User', email: '' }} />
          </motion.div>
        );

      case 'security':
        return (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.sectionContent}
          >
            <SecurityCard />
          </motion.div>
        );

      case 'about':
        return (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.sectionContent}
          >
            <AboutCard />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={styles.settingsPage}
    >
      <PageHeader
        title="Settings"
        description="Manage your preferences and workspace configuration."
      />

      <div className={styles.settingsWorkspace}>
        {/* Left Side: Navigation Menu */}
        <div className={styles.navigationColumn}>
          <SettingsNavigation activeTab={activeTab} onChangeTab={setActiveTab} />
        </div>

        {/* Right Side: Active Settings Panel Content */}
        <div className={styles.contentColumn}>
          <AnimatePresence mode="wait">{renderActiveSection()}</AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
