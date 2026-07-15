import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Eye,
  Settings,
  Plus,
} from 'lucide-react';
import { usePermissions } from '../../auth/hooks/usePermissions';
import styles from './BottomNav.module.scss';

const BottomNav = () => {
  const permissions = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();

  // Left nav items
  const leftItems = [
    { label: 'Home', path: '/dashboard', icon: <LayoutDashboard /> },
    { label: 'Tasks', path: '/tasks', icon: <CheckSquare /> },
  ];

  // Right nav items
  const rightItems = [
    permissions.canReviewTask && { label: 'Review', path: '/review', icon: <Eye /> },
    { label: 'Settings', path: '/settings', icon: <Settings /> },
  ].filter(Boolean);

  const isActive = (item) =>
    item.path === '/tasks'
      ? location.pathname === '/tasks' || (location.pathname.startsWith('/tasks/') && location.pathname !== '/tasks/create')
      : location.pathname.startsWith(item.path);

  const renderItem = (item) => (
    <Link
      key={item.label}
      to={item.path}
      className={`${styles.navItem} ${isActive(item) ? styles.active : ''}`}
    >
      {isActive(item) && (
        <motion.div
          layoutId="activeBottomTabBg"
          className={styles.activeBg}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      <span className={styles.icon}>{item.icon}</span>
      <span className={styles.labelText}>{item.label}</span>
    </Link>
  );

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navGroup}>{leftItems.map(renderItem)}</div>

      {/* Centre Add Task FAB */}
      <div className={styles.fabWrapper}>
        <motion.button
          className={styles.fab}
          onClick={() => navigate('/tasks/create')}
          whileTap={{ scale: 0.88 }}
          title="Create new task"
          aria-label="Create new task"
        >
          <Plus strokeWidth={2.5} size={22} />
        </motion.button>
      </div>

      <div className={styles.navGroup}>{rightItems.map(renderItem)}</div>
    </nav>
  );
};

export default BottomNav;
