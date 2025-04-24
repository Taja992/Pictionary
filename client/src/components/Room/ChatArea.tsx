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

  // Listen for incoming chat messages and room updates from WebSocket
  useEffect(() => {
    // Chat message handler (updated)
    const handleChatMessage = (data: any) => {

      // Skip messages from self - they're already in state
      if (data.Username === currentUsername) {
        return;
      }
      
      const newMsg = {
        id: Date.now().toString(),
        sender: data.Username,
        text: data.Message,
        isSystem: false
      };
      
      setMessages(prev => [...prev, newMsg]);
    };
    
    // Room update handler with improved logging
    const handleRoomUpdate = (data: any) => {


      // Check if data is formatted correctly
      if (!data || data.eventType !== 'RoomUpdate') {
        console.warn('Invalid RoomUpdate data received:', data);
        return;
      }

      let messageText = '';
      
      // Check Action value directly from the received data
      if (data.Action === 0) { // Joined
        messageText = `${data.Username} joined the room`;

      } else if (data.Action === 1) { // Left
        messageText = `${data.Username} left the room`;

      } else {
        console.warn('Unknown RoomAction value:', data.Action);
      }

      
      if (messageText) {
        // Create the new message
        const systemMsg = {
          id: Date.now().toString(),
          sender: 'System',
          text: messageText,
          isSystem: true
        };
        
        // Update the state directly rather than using a callback
        setMessages(prev => [...prev, systemMsg]);
      }
    };
    
    // Subscribe to both event types
    websocketClient.on(MessageType.CHAT_MESSAGE, handleChatMessage);
    websocketClient.on(MessageType.ROOM_UPDATE, handleRoomUpdate);
    
    // Clean up both
    return () => {
      websocketClient.off(MessageType.CHAT_MESSAGE, handleChatMessage);
      websocketClient.off(MessageType.ROOM_UPDATE, handleRoomUpdate);
    };
  }, [currentUsername, setMessages]);
  
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