import React from 'react';
import styles from './Select.module.scss';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({
  label,
  error,
  options = [],
  className = '',
  id,
  placeholder,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`${styles.selectWrapper} ${error ? styles.hasError : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.container}>
        <select
          ref={ref}
          id={selectId}
          className={styles.select}
          defaultValue=""
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.chevron} aria-hidden="true">
          <ChevronDown />
        </span>
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
