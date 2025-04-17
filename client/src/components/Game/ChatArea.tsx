import React, { useState } from 'react';

interface Message {
  id: string;
  sender: string;
  text: string;
  isSystem: boolean;
}

interface ChatAreaProps {
  initialMessages?: Message[];
  onSendMessage?: (message: string) => void;
}

export default function ChatArea({ 
  initialMessages = [], 
  onSendMessage 
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  
  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const newMsg = {
      id: Date.now().toString(),
      sender: localStorage.getItem('playerName') || 'You',
      text: newMessage,
      isSystem: false
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    if (onSendMessage) {
      onSendMessage(newMessage);
    }
    
    // Here you would check if the message is a correct guess
    // and send it to the WebSocket server
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`chat-message ${msg.isSystem ? 'system-message' : ''}`}
          >
            <span className="message-sender">{msg.sender}:</span>
            <span className="message-text">{msg.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="chat-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="chat-input"
          placeholder="Type your guess..."
        />
        <button type="submit" className="chat-send-btn">
          Send
        </button>
      </form>
    </div>
  );
}