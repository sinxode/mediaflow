import React from 'react';
import { motion } from 'framer-motion';
import styles from './PrioritySelector.module.scss';

const PrioritySelector = ({ value, onChange }) => {
  const options = ['Low', 'Medium', 'High'];

  return (
    <div className={styles.prioritySelector}>
      <span className={styles.label}>Task Priority</span>
      <div className={styles.chipsRow}>
        {options.map((option) => {
          const isSelected = value.toLowerCase() === option.toLowerCase();
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`${styles.chip} ${isSelected ? styles.selected : ''}`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activePriorityBg"
                  className={styles.activeBg}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className={styles.chipText}>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PrioritySelector;
