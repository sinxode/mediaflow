import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  PlusSquare,
  Eye,
  Settings
} from 'lucide-react';
import { usePermissions } from '../../auth/hooks/usePermissions';
import styles from './BottomNav.module.scss';

const BottomNav = () => {
  const permissions = usePermissions();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard /> },
    { label: 'Tasks', path: '/tasks', icon: <CheckSquare /> },
    permissions.canCreateTask && { label: 'Create', path: '/tasks/create', icon: <PlusSquare /> },
    permissions.canReviewTask && { label: 'Review', path: '/review', icon: <Eye /> },
    { label: 'Settings', path: '/settings', icon: <Settings /> },
  ].filter(Boolean);

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = item.path === '/tasks'
          ? (location.pathname === '/tasks' || (location.pathname.startsWith('/tasks/') && location.pathname !== '/tasks/create'))
          : location.pathname.startsWith(item.path);
        return (
          <Link
            key={item.label}
            to={item.path}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            {isActive && (
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
      })}
    </nav>
  );
};

export default BottomNav;
