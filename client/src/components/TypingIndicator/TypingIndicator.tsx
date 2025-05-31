import React from 'react';
import styles from './TypingIndicator.module.scss';

interface TypingIndicatorProps {
  side: 'left' | 'right';
  isActive: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ side, isActive }) => (
  <div className={`${styles.typingRow} ${side === 'right' ? styles.right : styles.left}`}>
    {isActive && (
      <div className={styles.typingIndicator}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
    )}
  </div>
);

export default TypingIndicator;
