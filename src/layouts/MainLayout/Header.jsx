import React from 'react';
import { Menu } from 'lucide-react';
import SearchBar from '../../components/SearchBar/SearchBar';
import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import NotificationBell from '../../components/Notifications/NotificationBell';
import { useAuth } from '../../auth/hooks/useAuth';
import styles from './Header.module.scss';

const Header = ({ onMenuClick }) => {
  const { user, role, isDualRole, toggleRole } = useAuth();

  const displayName = user?.name || 'User';
  const displayRole = role ? (role.charAt(0).toUpperCase() + role.slice(1)) : 'Member';

  return (
    <header className={styles.header}>
      {/* Mobile Burger Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        className={styles.menuButton}
        aria-label="Toggle menu"
      >
        <Menu />
      </Button>

      {/* Brand title on Mobile */}
      <div className={styles.brandWrapper}>
        <img src="/logo.png" alt="MediaFlow Logo" className={styles.logoImg} />
        <span className={styles.brandTitle}>MediaFlow</span>
      </div>

      {/* Search Input Container */}
      <div className={styles.searchContainer}>
        <SearchBar className={styles.searchBar} />
      </div>

      {/* Action triggers */}
      <div className={styles.actions}>
        {isDualRole && (
          <button
            type="button"
            onClick={toggleRole}
            className={styles.roleToggleButton}
            title={`Switch view/role permissions to ${role === 'reviewer' ? 'Manager (Creator)' : 'Reviewer'}`}
          >
            Acting as: <strong>{role === 'reviewer' ? 'Reviewer' : 'Manager'}</strong> ⇄
          </button>
        )}
        <NotificationBell />
        <div className={styles.userProfile}>
          <Avatar
            src={user?.avatar_url}
            name={displayName}
            size="md"
          />
          <div className={styles.userInfo}>
            <span className={styles.userName}>{displayName}</span>
            <span className={styles.userRole}>{displayRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
