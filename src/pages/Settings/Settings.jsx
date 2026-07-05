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
import { NotificationService } from '../../services/notifications/notificationService';
import styles from './Settings.module.scss';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');

  // Database-synced notification preferences
  const [prefs, setPrefs] = useState({
    push_enabled: true,
    email_enabled: false,
    mentions: true,
    review_requests: true,
    assignments: true,
    approvals: true,
    publishing_updates: true,
    team_hub_updates: true
  });

  useEffect(() => {
    const fetchPrefs = async () => {
      if (!user) return;
      try {
        const p = await NotificationService.getPreferences(user.id);
        setPrefs(p);
      } catch (err) {
        console.warn('Failed to load user preferences from database', err);
      }
    };
    fetchPrefs();
  }, [user?.id]);

  const handlePrefToggle = async (key) => {
    if (!user) return;
    try {
      const newValue = !prefs[key];
      const updated = await NotificationService.updatePreferences(user.id, { [key]: newValue });
      setPrefs(updated);
    } catch (err) {
      console.warn('Failed to save preference to database', err);
    }
  };

  // Preferences state - initialized from localStorage caching
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mediaflow_theme') || 'system';
  });

  const [notifications, setNotifications] = useState({
    assigned: true,
    review: true,
    approved: false,
    published: true,
    comments: true
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
                <h4 style={{ fontSize: '12px', color: '#8B5CF6', margin: '12px 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>Delivery Channels</h4>
                <SettingToggle
                  label="Simulated Push Notifications"
                  description="Receive instant popover alert banners on desktop and native pushes."
                  checked={prefs.push_enabled}
                  onChange={() => handlePrefToggle('push_enabled')}
                />
                <SettingToggle
                  label="Email Digests"
                  description="Receive updates and activity reviews directly to your email address."
                  checked={prefs.email_enabled}
                  onChange={() => handlePrefToggle('email_enabled')}
                />

                <h4 style={{ fontSize: '12px', color: '#8B5CF6', margin: '18px 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>Notification Events</h4>
                <SettingToggle
                  label="Mentions (@username)"
                  description="Receive alerts immediately when someone mentions you in discussion comments."
                  checked={prefs.mentions}
                  onChange={() => handlePrefToggle('mentions')}
                />
                <SettingToggle
                  label="Task Assigned"
                  description="Receive alerts when a workflow task is assigned to you."
                  checked={prefs.assignments}
                  onChange={() => handlePrefToggle('assignments')}
                />
                <SettingToggle
                  label="Review Requested"
                  description="Receive alerts when a task submission is ready for your review."
                  checked={prefs.review_requests}
                  onChange={() => handlePrefToggle('review_requests')}
                />
                <SettingToggle
                  label="Task Approved"
                  description="Receive alerts when a reviewer approves your submitted deliverables."
                  checked={prefs.approvals}
                  onChange={() => handlePrefToggle('approvals')}
                />
                <SettingToggle
                  label="Task Published"
                  description="Receive alerts when reviewed content goes live or is marked published."
                  checked={prefs.publishing_updates}
                  onChange={() => handlePrefToggle('publishing_updates')}
                />
                <SettingToggle
                  label="Team Hub Updates"
                  description="Receive alerts when new ideas or plans are created (badges still show in hub)."
                  checked={prefs.team_hub_updates}
                  onChange={() => handlePrefToggle('team_hub_updates')}
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
