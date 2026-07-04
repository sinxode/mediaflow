import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckSquare, Eye, Globe, Clock, Filter } from 'lucide-react';
import PageHeader from '../../components/PageHeader/PageHeader';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import MetricCard from '../../components/Analytics/MetricCard';
import WorkloadPanel from '../../components/Analytics/WorkloadPanel';
import WorkflowHealthPanel from '../../components/Analytics/WorkflowHealthPanel';
import CategoryInsights from '../../components/Analytics/CategoryInsights';
import AnalyticsSkeleton from '../../components/Analytics/AnalyticsSkeleton';
import { AnalyticsService } from '../../services/analytics/analyticsService';
import { UserService } from '../../services/users/userService';
import { CATEGORIES } from '../../constants';
import { pageVariants, fadeUpVariants } from '../../utils/animations';
import styles from './Analytics.jsx.module.scss';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  // Filtering States
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch real team members list on mount
  useEffect(() => {
    const loadUsersList = async () => {
      try {
        const list = await UserService.getAllUsers();
        setUsers(list || []);
      } catch (err) {
        console.error('Failed to load user filters', err);
      }
    };
    loadUsersList();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedUser) filters.user = selectedUser;
      if (selectedCategory) filters.category = selectedCategory;

      const res = await AnalyticsService.getAnalyticsData(filters);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedUser, selectedCategory]);

  const handleResetFilters = () => {
    setSelectedUser('');
    setSelectedCategory('');
  };

  if (loading || !data) {
    return (
      <div style={{ padding: '24px' }}>
        <AnalyticsSkeleton />
      </div>
    );
  }

  const overviewStats = [
    {
      title: 'Active Workload',
      value: data.overview.activeTasks,
      description: 'Tasks in current cycle',
      icon: <CheckSquare />
    },
    {
      title: 'Pending Reviews',
      value: data.overview.tasksInReview,
      description: 'Sign-offs outstanding',
      icon: <Eye />
    },
    {
      title: 'Monthly Releases',
      value: data.overview.publishedThisMonth,
      description: 'Published deliverables',
      icon: <Globe />
    },
    {
      title: 'Avg Review Time',
      value: data.overview.avgReviewTime,
      description: 'Time to approve assets',
      icon: <Clock />
    }
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={styles.analyticsPage}
    >
      <PageHeader
        title="Analytics & Insights"
        description="Actionable operational intelligence and workload diagnostics."
      />

      {/* Filter Section */}
      <div className={styles.filtersBar}>
        <div className={styles.filterMeta}>
          <Filter className={styles.filterIcon} />
          <span className={styles.filterText}>Filter Insights:</span>
        </div>
        
        <div className={styles.dropdownsRow}>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className={styles.select}
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.select}
          >
            <option value="">All Categories</option>
            {Object.values(CATEGORIES).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {(selectedUser || selectedCategory) && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Row 1: Metric Grids */}
      <div className={styles.metricsGrid}>
        {overviewStats.map((stat, idx) => (
          <motion.div key={idx} variants={fadeUpVariants}>
            <MetricCard
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
            />
          </motion.div>
        ))}
      </div>

      {/* Row 2: Workload vs Health Bottlenecks */}
      <div className={styles.workspaceGrid}>
        <motion.div variants={fadeUpVariants} className={styles.col}>
          <WorkloadPanel workload={data.workload} />
        </motion.div>
        
        <motion.div variants={fadeUpVariants} className={styles.col}>
          <WorkflowHealthPanel health={data.health} />
        </motion.div>
      </div>

      {/* Row 3: Category stats */}
      <motion.div variants={fadeUpVariants}>
        <CategoryInsights categories={data.categories} />
      </motion.div>
    </motion.div>
  );
};

export default Analytics;
