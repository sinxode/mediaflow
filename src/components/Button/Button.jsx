import React from 'react';
import { motion } from 'framer-motion';
import styles from './Button.module.scss';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost'
  size = 'md',        // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...props
}) => {
  const isButtonDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      disabled={isButtonDisabled}
      onClick={!isButtonDisabled ? onClick : undefined}
      whileHover={!isButtonDisabled ? { scale: 1.015, y: -0.5 } : {}}
      whileTap={!isButtonDisabled ? { scale: 0.985, y: 0 } : {}}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className={styles.spinner} aria-hidden="true">
          <svg className={styles.svg} viewBox="0 0 24 24">
            <circle
              className={styles.circle}
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="3"
            />
          </svg>
        </span>
      )}
      
      {!loading && leftIcon && <span className={styles.icon}>{leftIcon}</span>}
      <span className={styles.content}>{children}</span>
      {!loading && rightIcon && <span className={styles.icon}>{rightIcon}</span>}
    </motion.button>
  );
};

export default Button;
