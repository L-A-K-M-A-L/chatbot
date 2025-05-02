import React, { useState, useRef } from 'react';
import 'react-app-polyfill/stable';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');

    try {
      const response = await fetch('http://localhost:5001/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
        credentials: 'include'
      });

      if (!response.ok || !response.body) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let fullReply = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;

          const chunk = line.replace('data:', '').trim();
          fullReply += chunk;

          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return [...prev.slice(0, -1), { role: 'assistant', content: fullReply }];
            } else {
              return [...prev, { role: 'assistant', content: fullReply }];
            }
          });
          scrollToBottom();
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Failed to load response.' }]);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ color: msg.role === 'user' ? 'blue' : 'green' }}>
            <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div style={{ marginTop: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          style={{ width: '80%', padding: 10 }}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage} style={{ padding: 10 }}>Send</button>
      </div>
    </div>
  );
};

export default ChatBot;
