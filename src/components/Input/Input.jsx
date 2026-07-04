import React from 'react';
import styles from './Input.module.scss';

const Input = React.forwardRef(({
  label,
  error,
  leftIcon = null,
  rightIcon = null,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`${styles.inputWrapper} ${error ? styles.hasError : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.container}>
        {leftIcon && <div className={`${styles.icon} ${styles.left}`}>{leftIcon}</div>}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`${styles.input} ${leftIcon ? styles.hasLeftIcon : ''} ${rightIcon ? styles.hasRightIcon : ''}`}
          {...props}
        />
        {rightIcon && <div className={`${styles.icon} ${styles.right}`}>{rightIcon}</div>}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
