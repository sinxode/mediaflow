import React from 'react';
import styles from './Textarea.module.scss';

const Textarea = React.forwardRef(({
  label,
  error,
  className = '',
  id,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`${styles.textareaWrapper} ${error ? styles.hasError : ''} ${className}`}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={styles.textarea}
        {...props}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
