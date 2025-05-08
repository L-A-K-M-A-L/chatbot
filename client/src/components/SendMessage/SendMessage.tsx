import React from 'react';
import { SendOutlined } from '@ant-design/icons';
import styles from './SendMessage.module.scss';

interface SendMessageProps {
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
  setIsUserTyping: (typing: boolean) => void;
}

const SendMessage: React.FC<SendMessageProps> = ({ input, setInput, sendMessage, setIsUserTyping }) => {
  return (
    <div className={styles.sendMessageWrapper}>
      <input
        className={styles.input}
        value={input}
        placeholder="Type your message..."
        onFocus={() => setIsUserTyping(true)}
        onBlur={() => setIsUserTyping(false)}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && sendMessage()}
      />
      <button className={styles.sendBtn} onClick={sendMessage}>
        <SendOutlined />
      </button>
    </div>
  );
};

export default SendMessage;
