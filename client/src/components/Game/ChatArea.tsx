import React, { useState, useEffect, useRef } from 'react';
import { websocketClient } from '../../api/websocket-client';
import { MessageType } from '../../api/websocket-types';

interface Message {
  id: string;
  sender: string;
  text: string;
  isSystem: boolean;
}

interface ChatAreaProps {
  initialMessages?: Message[];
  onSendMessage?: (message: string) => void;
  roomId: string;
  username?: string;
}

export default function ChatArea({ 
  initialMessages = [], 
  onSendMessage,
  roomId,
  username
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get the current username
  const currentUsername = username || localStorage.getItem('playerName') || 'You';

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for incoming chat messages from WebSocket
  useEffect(() => {
    const handleChatMessage = (data: any) => {
      // Skip messages that originated from this client to avoid duplication
      // Don't skip any messages - we'll handle duplication differently
      
      const newMsg = {
        id: Date.now().toString(),
        sender: data.Username,
        text: data.Message,
        isSystem: false
      };
      
      // Use functional update to avoid stale state issues
      setMessages(prevMessages => {
        // Check if this message already exists in our state
        // This prevents duplicates when receiving our own messages back
        const isDuplicate = prevMessages.some(msg => 
          msg.sender === data.Username && 
          msg.text === data.Message &&
          // Check if the message was added very recently (within last 2 seconds)
          Date.now() - parseInt(msg.id) < 2000
        );
        
        if (!isDuplicate) {
          return [...prevMessages, newMsg];
        }
        return prevMessages;
      });
    };
    
    // Subscribe to chat messages
    websocketClient.on(MessageType.CHAT_MESSAGE, handleChatMessage);
    
    // Clean up on unmount
    return () => {
      websocketClient.off(MessageType.CHAT_MESSAGE, handleChatMessage);
    };
  }, [currentUsername]); // Only depend on currentUsername, not messages
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Add to local state immediately so the sender sees their message
    const newMsg = {
      id: Date.now().toString(),
      sender: currentUsername,
      text: newMessage,
      isSystem: false
    };
    
    setMessages(prevMessages => [...prevMessages, newMsg]);
    
    // Send through WebSocket
    websocketClient.sendChatMessage(newMessage, currentUsername, roomId);
    
    // Call the callback if provided
    if (onSendMessage) {
      onSendMessage(newMessage);
    }
    
    // Clear the input
    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-messages" style={{ overflowY: 'auto', maxHeight: '400px' }}>
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`chat-message ${msg.isSystem ? 'system-message' : ''}`}
          >
            <span className="message-sender">{msg.sender}:</span>
            <span className="message-text">{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Empty div for scrolling to bottom */}
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