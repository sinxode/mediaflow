import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check } from 'lucide-react';
import Avatar from '../../../components/Avatar/Avatar';
import { UserService } from '../../../services/users/userService';
import styles from './UserSelector.module.scss';

const UserSelector = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [usersList, setUsersList] = useState([]);
  const containerRef = useRef(null);

  // Load real team members from database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const list = await UserService.getAllUsers();
        setUsersList(list || []);
      } catch (err) {
        console.error('Failed to load user options', err);
      }
    };
    fetchUsers();
  }, []);

  // Close on outside clicks
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedUser = usersList.find((u) => u.id === value) || {
    name: 'Select user',
    role: 'Unassigned'
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className={`${styles.userSelector} ${isOpen ? styles.open : ''}`}>
      <span className={styles.label}>Assigned User</span>

      {/* Select Box Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`${styles.selectBox} ${isOpen ? styles.activeBox : ''}`}
      >
        <div className={styles.selectedUserInfo}>
          <Avatar name={selectedUser.name} size="sm" />
          <div className={styles.meta}>
            <span className={styles.name}>{selectedUser.name}</span>
            <span className={styles.role}>{selectedUser.role}</span>
          </div>
        </div>
        <ChevronDown className={styles.chevron} />
      </div>

      {/* Dropdown Overlay List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.15 }}
            className={styles.dropdown}
          >
            {/* Search filter input inside dropdown */}
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search team members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
                autoFocus
              />
            </div>

            {/* List */}
            <div className={styles.usersList}>
              {filteredUsers.map((user) => {
                const isSelected = value === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      onChange(user.id);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`${styles.userRow} ${isSelected ? styles.selectedRow : ''}`}
                  >
                    <div className={styles.userRowInfo}>
                      <Avatar name={user.name} size="sm" />
                      <div className={styles.meta}>
                        <span className={styles.name}>{user.name}</span>
                        <span className={styles.role}>{user.role}</span>
                      </div>
                    </div>
                    {isSelected && <Check className={styles.checkIcon} />}
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className={styles.emptyState}>No members found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSelector;
