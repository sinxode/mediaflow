import React from 'react';
import styles from './MentionRenderer.module.scss';

const MentionRenderer = ({ text }) => {
  if (!text) return null;

  // Split text by mention patterns (e.g., @Muhammad Sinan or @Zain)
  const parts = text.split(/(@[A-Za-z0-9_.-]+(?:\s[A-Za-z0-9_.-]+)?)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('@') && part.length > 1) {
          return (
            <span key={index} className={styles.mention}>
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
};

export default MentionRenderer;
export { MentionRenderer };
