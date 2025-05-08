import React from 'react';
import styles from './TypingIndicator.module.scss';

interface TypingIndicatorProps {
  side: 'left' | 'right';
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ side }) => (
  <div className={`${styles.typingRow} ${side === 'right' ? styles.right : styles.left}`}>
    <div className={styles.typingIndicator}>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
    </div>
  </div>
);

export default TypingIndicator;
