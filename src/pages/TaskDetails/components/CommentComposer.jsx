import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import Avatar from '../../../components/Avatar/Avatar';
import Button from '../../../components/Button/Button';
import MentionAutocomplete from '../../../components/Mentions/MentionAutocomplete';
import styles from './CommentComposer.module.scss';

const CommentComposer = ({ currentUser, onAddComment, loading = false }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  const maxChars = 1000;

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || message.length > maxChars || loading) return;
    onAddComment(message.trim());
    setMessage('');
  };

  return (
    <form onSubmit={handleSend} className={styles.composerForm}>
      <div className={styles.avatarCol}>
        <Avatar name={currentUser?.name || 'Jane Doe'} size="sm" />
      </div>

      <div className={styles.inputCol} style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          placeholder="Write a message in this discussion..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={styles.textarea}
          rows={3}
          maxLength={maxChars}
          disabled={loading}
        />
        <MentionAutocomplete
          textareaRef={textareaRef}
          value={message}
          onChange={setMessage}
        />
        
        <div className={styles.footerRow}>
          <span className={`${styles.charCount} ${message.length >= maxChars - 50 ? styles.limitWarn : ''}`}>
            {message.length} / {maxChars}
          </span>
          
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!message.trim() || message.length > maxChars || loading}
            leftIcon={<Send />}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentComposer;
