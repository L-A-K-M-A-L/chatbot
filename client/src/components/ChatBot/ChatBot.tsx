import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatBot.module.scss';
import { CloseOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import SendMessage from '../SendMessage/SendMessage';
import ChatMessage from '../ChatMessage/ChatMessage';
import TypingIndicator from '../TypingIndicator/TypingIndicator';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping, isUserTyping]);

  // Show initial welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            role: 'assistant',
            content: 'Welcome to our IT Partnership Wizard! I can help you explore our services in Development, UI/UX Design, or Quality Assurance. Which area are you interested in?'
          }
        ]);
      }, 500);
    }
  }, [isOpen, messages.length]);


  const sendMessage = async () => {
    if (!input.trim()) return;

    if (input.includes('thank') || input.includes('thanks') || input.includes('thank you') || input.includes('close')) {

      setMessages(prev => [...prev, { role: 'assistant', content: 'You are welcome! If you have any more questions, feel free to ask.' }]);
      setInput('');
      setTimeout(() => {
        setIsOpen(false);
        setMessages([]);
        setIsBotTyping(false);
        setIsUserTyping(false);
      }, 700);

        const resetChat = async () => {
        await fetch('http://localhost:5001/api/chat/reset', { method: 'POST', credentials: 'include' });
        setMessages([]);
      };
      return;
    }

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsBotTyping(true);

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok || !response.body) throw new Error('Network response failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let fullReply = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const chunk = line.replace('data:', '').trim();
          fullReply += chunk + ' ';
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return [...prev.slice(0, -1), { role: 'assistant', content: fullReply }];
            } else {
              return [...prev, { role: 'assistant', content: fullReply }];
            }
          });
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Failed to get response.' }]);
    } finally {
      setIsBotTyping(false);
    }
  };

  return isOpen ? (
    <div className={styles.chatbotContainer}>
      <div className={styles.header}>
        {/* <CustomerServiceOutlined /> */}
        <img src='/images/logo.svg' alt='logo' style={{ width: 90, height: 50 }} />
        <CloseOutlined onClick={() => setIsOpen(false)} />
      </div>
      <div className={styles.chatBody}>
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} role={msg.role} content={msg.content} />
        ))}
        {(isBotTyping || isUserTyping) && (
          <TypingIndicator side={isBotTyping ? 'left' : 'right'}
            isActive={isBotTyping || isUserTyping}
          />
        )}
        <div ref={chatEndRef} />
      </div>
      <div className={styles.footer}>
        <SendMessage
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          setIsUserTyping={setIsUserTyping}
        />
      </div>
    </div>
  ) : (
    <button className={styles.launchBtn} onClick={() => setIsOpen(true)}>
      <CustomerServiceOutlined />
    </button>
  );
};

export default ChatBot;
