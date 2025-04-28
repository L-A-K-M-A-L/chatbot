// src/components/ChatBot.tsx

import React, { useState, useRef } from 'react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await axios.post('http://localhost:5000/chat', { message: input }, { responseType: 'stream' });

      const reader = response.data.getReader();
      let botContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.replace('data:', '').trim();
            if (data) {
              botContent += data;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return [...prev.slice(0, -1), { role: 'assistant', content: botContent }];
                } else {
                  return [...prev, { role: 'assistant', content: botContent }];
                }
              });
              scrollToBottom();
            }
          }
        }
      }
    } catch (error) {
      console.error('Error streaming:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          color: 'white',
          fontSize: '30px',
          border: 'none',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        💬
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '300px',
            maxHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            zIndex: 1000
          }}
        >
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: '10px', color: msg.role === 'user' ? 'blue' : 'green' }}>
                <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div style={{ display: 'flex', borderTop: '1px solid #ccc' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              style={{ flex: 1, padding: '10px', border: 'none' }}
            />
            <button onClick={sendMessage} style={{ padding: '10px', border: 'none', background: '#007bff', color: 'white' }}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
