import React, { useState, useEffect, useRef } from 'react';
import { UserService } from '../../services/users/userService';
import Avatar from '../Avatar/Avatar';
import styles from './MentionAutocomplete.module.scss';

const MentionAutocomplete = ({ textareaRef, value, onChange, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerIndex, setTriggerIndex] = useState(-1);
  const [users, setUsers] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const listRef = useRef(null);

  // Load user profiles
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const list = await UserService.getAllUsers();
        // Ensure fallback users if database is empty
        const safeList = list && list.length > 0 ? list : [
          { id: 'user-muhammad', name: 'Muhammad Sinan', role: 'creator', email: 'sinan@sunnah.org' },
          { id: 'user-zain', name: 'Zain Sunnah', role: 'reviewer', email: 'zain@sunnah.org' },
          { id: 'user-admin', name: 'System Admin', role: 'admin', email: 'admin@sunnah.org' }
        ];
        setUsers(safeList);
      } catch (err) {
        console.warn('Failed to load users for mentions', err);
      }
    };
    loadUsers();
  }, []);

  // Listen to input changes in the textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = () => {
      const caret = textarea.selectionStart;
      const textBeforeCaret = textarea.value.slice(0, caret);
      const lastAtPos = textBeforeCaret.lastIndexOf('@');

      if (lastAtPos !== -1) {
        // Must be preceded by space, newline or start of string
        const charBeforeAt = lastAtPos > 0 ? textBeforeCaret[lastAtPos - 1] : ' ';
        const isValidTrigger = [' ', '\n', '\t'].includes(charBeforeAt);
        const textAfterAt = textBeforeCaret.slice(lastAtPos + 1);

        // Cancel if there's any space in the query (means typing next words)
        const hasSpace = /\s/.test(textAfterAt);

        if (isValidTrigger && !hasSpace) {
          setIsOpen(true);
          setSearchQuery(textAfterAt);
          setTriggerIndex(lastAtPos);
          setActiveIndex(0);
          updateCoords(textarea, lastAtPos);
          return;
        }
      }

      setIsOpen(false);
    };

    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('keyup', handleInput);
    textarea.addEventListener('click', handleInput);

    return () => {
      textarea.removeEventListener('input', handleInput);
      textarea.removeEventListener('keyup', handleInput);
      textarea.removeEventListener('click', handleInput);
    };
  }, [textareaRef]);

  // Adjust absolute coordinates under cursor
  const updateCoords = (textarea, lastAtPos) => {
    try {
      const { offsetTop, offsetLeft, clientHeight } = textarea;
      // Approximate position below the input line
      setCoords({
        top: offsetTop + clientHeight - 40, 
        left: Math.min(offsetLeft + (lastAtPos * 6), textarea.clientWidth - 200)
      });
    } catch {
      setCoords({ top: 40, left: 10 });
    }
  };

  // Keyboard navigation overrides
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !isOpen) return;

    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % filteredUsers.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          selectUser(filteredUsers[activeIndex]);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setIsOpen(false);
          textarea.focus();
        }
      }
    };

    textarea.addEventListener('keydown', handleKeyDown);
    return () => textarea.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, users, searchQuery]);

  const selectUser = (user) => {
    const textarea = textareaRef.current;
    if (!textarea || !user) return;

    const caret = textarea.selectionStart;
    const text = textarea.value;
    
    // Replace '@searchQuery' with '@Username'
    const before = text.slice(0, triggerIndex);
    const after = text.slice(caret);
    const mentionText = `@${user.name} `;
    
    const newValue = before + mentionText + after;
    
    // Update React State
    onChange(newValue);
    if (onSelect) {
      onSelect(user);
    }

    setIsOpen(false);

    // Set cursor position back after insert
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = triggerIndex + mentionText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen || filteredUsers.length === 0) return null;

  return (
    <div 
      ref={listRef}
      className={styles.mentionList}
      style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
    >
      {filteredUsers.map((u, index) => (
        <div
          key={u.id}
          className={`${styles.mentionItem} ${index === activeIndex ? styles.active : ''}`}
          onClick={() => selectUser(u)}
        >
          <Avatar name={u.name} size="xs" />
          <div className={styles.meta}>
            <span className={styles.name}>{u.name}</span>
            <span className={styles.role}>{u.role}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MentionAutocomplete;
