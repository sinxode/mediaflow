import React, { useState } from 'react';
import Button from '../../../components/Button/Button';
import styles from './CommentEditor.module.scss';

const CommentEditor = ({ initialMessage, onSave, onCancel, loading = false }) => {
  const [message, setMessage] = useState(initialMessage);

  const handleSave = (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    onSave(message.trim());
  };

  return (
    <form onSubmit={handleSave} className={styles.editorForm}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className={styles.textarea}
        rows={3}
        disabled={loading}
      />
      <div className={styles.actionsRow}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!message.trim() || loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default CommentEditor;
