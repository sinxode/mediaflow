import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  PlusSquare,
  Eye,
  CheckCircle2,
  User,
  Settings,
  BarChart3,
  LogOut,
  X,
  MessageSquare,
  Bell,
  RefreshCw,
  Monitor,
  Inbox,
  Play,
  History,
  Users,
  Sliders,
  ExternalLink
} from 'lucide-react';
import Button from '../../components/Button/Button';
import ConnectionStatus from '../../components/ConnectionStatus/ConnectionStatus';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { useAuth } from '../../auth/hooks/useAuth';
import styles from './Sidebar.module.scss';

const Sidebar = ({ isOpen, onClose, onLogoutClick }) => {
  const permissions = usePermissions();
  const { role } = useAuth();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard /> },
    { label: 'Tasks', path: '/tasks', icon: <CheckSquare /> },
    permissions.canCreateTask && { label: 'Create Task', path: '/tasks/create', icon: <PlusSquare /> },
    permissions.canReviewTask && { label: 'Review Queue', path: '/review', icon: <Eye /> },
    { label: 'Recurring Workflows', path: '/workflows', icon: <RefreshCw /> },
    { label: 'Archive', path: '/published', icon: <CheckCircle2 /> },
    { type: 'separator' },
    { type: 'header', label: 'Ignite LabOS' },
    { label: 'Computer Lab', path: '/lab/dashboard', icon: <Monitor /> },
    { label: 'Student Portal', path: '/lab/portal', icon: <ExternalLink /> },
    { type: 'separator' },
    { label: 'Notifications', path: '/notifications', icon: <Bell /> },
    role !== 'reviewer' && { label: 'Analytics', path: '/analytics', icon: <BarChart3 /> },
    { label: 'Settings', path: '/settings', icon: <Settings /> },
  ].filter(Boolean);

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      {/* Sidebar Header */}
      <div className={styles.header}>
        <div className={styles.brandWrapper}>
          <img src="/logo.png" alt="MediaFlow Logo" className={styles.logoImg} />
          <span className={styles.logo}>MediaFlow</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close sidebar"
        >
          <X />
        </Button>
      </div>

      {/* Nav Menu */}
      <nav className={styles.nav}>
        <div className={styles.linksGroup}>
          {menuItems.map((item, index) => {
            if (item.type === 'separator') {
              return <div key={`sep-${index}`} className={styles.separator} />;
            }
            if (item.type === 'header') {
              return <div key={`hdr-${index}`} className={styles.menuHeader}>{item.label}</div>;
            }
            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className={styles.footer}>
          <button
            onClick={() => {
              onClose();
              onLogoutClick();
            }}
            className={styles.logoutButton}
          >
            <span className={styles.icon}><LogOut /></span>
            <span className={styles.label}>Logout</span>
          </button>
          
          <div className={styles.connectionWrapper}>
            <ConnectionStatus />
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
