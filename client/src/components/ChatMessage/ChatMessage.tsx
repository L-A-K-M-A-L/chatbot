import React from 'react';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import styles from './ChatMessage.module.scss';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  return (
    <div className={`${styles.messageRow} ${role === 'user' ? styles.user : styles.assistant}`}>
      <div className={styles.avatar}>
        {role === 'assistant' ? <RobotOutlined /> : <UserOutlined />}
      </div>
      <div className={styles.bubble}>{content}</div>
    </div>
  );
};

export default ChatMessage;
