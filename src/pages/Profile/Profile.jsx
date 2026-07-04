import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, ShieldAlert, Sparkles, User as UserIcon } from 'lucide-react';
import PageHeader from '../../components/PageHeader/PageHeader';
import Card from '../../components/Card/Card';
import EmptyState from '../../components/EmptyState/EmptyState';
import Button from '../../components/Button/Button';
import ProfileCard from './components/ProfileCard';
import ProfileStats from './components/ProfileStats';
import AchievementCard from './components/AchievementCard';
import ActivityFeed from '../../components/Activity/ActivityFeed';
import { useAuth } from '../../auth/hooks/useAuth';
import { TaskService } from '../../services/tasks/taskService';
import { pageVariants, fadeUpVariants } from '../../utils/animations';
import styles from './Profile.module.scss';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ created: 0, reviewed: 0, completed: 0, published: 0 });
  const [achievements, setAchievements] = useState([]);

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || '';
  const displayRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Member';
  const displayJoined = user?.joinedDate || 'July 2026';

  const userProfileData = {
    name: displayName,
    role: displayRole,
    email: displayEmail,
    joinedDate: displayJoined,
    avatarUrl: user?.avatar_url
  };

  useEffect(() => {
    const loadProfileStats = async () => {
      if (!user) return;
      try {
        const list = await TaskService.getTasks();
        const createdCount = list.filter(t => t.created_by === user.id).length;
        const reviewedCount = list.filter(t => (t.status === 'ready_for_review' || t.status === 'reviewing') && (t.assigned_to === user.id || t.created_by === user.id)).length;
        const completedCount = list.filter(t => t.status === 'completed' && t.assigned_to === user.id).length;
        const publishedCount = list.filter(t => t.status === 'published' && t.assigned_to === user.id).length;
        
        setStats({
          created: createdCount,
          reviewed: reviewedCount,
          completed: completedCount,
          published: publishedCount
        });

        const realAchievements = [
          { 
            title: 'First Task Created', 
            description: 'Logged your initial media item.', 
            icon: 'zap', 
            unlockedDate: createdCount > 0 ? 'Unlocked' : 'Locked' 
          },
          { 
            title: 'Active Reviews', 
            description: 'Check and approve active tasks.', 
            icon: 'shield', 
            unlockedDate: reviewedCount > 0 ? 'Unlocked' : 'Locked' 
          },
          { 
            title: 'Published Master', 
            description: 'Publish completed deliverables.', 
            icon: 'award', 
            unlockedDate: publishedCount > 0 ? 'Unlocked' : 'Locked' 
          },
          { 
            title: 'Closer', 
            description: 'Finish a workflow process completely.', 
            icon: 'flame', 
            unlockedDate: completedCount > 0 ? 'Unlocked' : 'Locked' 
          }
        ];
        setAchievements(realAchievements);
      } catch (err) {
        console.error('Failed to load profile statistics', err);
      }
    };
    loadProfileStats();
  }, [user?.id]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={styles.profilePage}
    >
      {/* Dynamic Header */}
      <PageHeader
        title="Profile"
        description="Manage your account and view your workflow activity."
      />

      <div className={styles.profileWorkspace}>
        {/* Left Side: Profile Details & Stats */}
        <div className={styles.mainContent}>
          <motion.div variants={fadeUpVariants} className={styles.wrapper}>
            <ProfileCard user={userProfileData} />
          </motion.div>

          {/* Stats Metrics Row */}
          <motion.div variants={fadeUpVariants} className={styles.wrapper}>
            <ProfileStats stats={stats} />
          </motion.div>
 
          {/* Achievements Row */}
          <motion.div variants={fadeUpVariants} className={styles.wrapper}>
            <AchievementCard achievements={achievements} />
          </motion.div>
        </div>
 
        {/* Right Side: Read-only Account parameters & Activity Timeline */}
        <div className={styles.sidebarColumn}>
          {/* Read-Only Account Parameters Panel */}
          <Card padding={true} className={styles.infoCard}>
            <h3 className={styles.sidebarTitle}>Account Information</h3>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Full Name</span>
                <span className={styles.infoValue}>{userProfileData.name}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>{userProfileData.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Platform Role</span>
                <span className={styles.infoValue}>{userProfileData.role}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>System Status</span>
                <span className={styles.statusVal}>
                  <span className={styles.statusDot} />
                  Active
                </span>
              </div>
            </div>
          </Card>
 
          {/* Timeline Feed - Dynamic Activity Feed */}
          <motion.div variants={fadeUpVariants} className={styles.wrapper}>
            <Card padding={true} className={styles.infoCard}>
              <h3 className={styles.sidebarTitle}>Recent Activity</h3>
              <ActivityFeed userId={user?.id} limit={5} />
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
