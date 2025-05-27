import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useWsClient } from 'ws-request-hook';
import { MessageType, ChatMessageDto, generateRequestId } from '../../api';
import { useAtom } from 'jotai';
import { systemMessagesAtom } from '../../atoms';
import './ChatArea.css';

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
  const [systemMessages] = useAtom(systemMessagesAtom);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get the WebSocket client
  const { send, onMessage } = useWsClient();
  
  // Get the current username
  const currentUsername = username || localStorage.getItem('playerName') || 'You';

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Combine user messages and system messages
  const allMessages = useMemo(() => {
    const convertedSystemMessages = systemMessages.map(msg => ({
      id: msg.id,
      sender: 'System',
      text: msg.text,
      isSystem: true
    }));
    
    // Combine and sort by timestamp
    const combined = [...messages, ...convertedSystemMessages];
    return combined.sort((a, b) => {
      return parseInt(a.id) - parseInt(b.id);
    });
  }, [messages, systemMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  // Listen for incoming chat messages
  useEffect(() => {
    if (!roomId) return;
    
    // Set up message handler with correct parameters
    const unsubscribe = onMessage<ChatMessageDto>(
      MessageType.CHAT_MESSAGE,
      (message) => {
        // Skip messages from self - they're already in state
        if (message.Username === currentUsername) {
          return;
        }
        
        const newMsg = {
          id: Date.now().toString(),
          sender: message.Username,
          text: message.Message,
          isSystem: false
        };
        
        setMessages(prev => [...prev, newMsg]);
      }
    );
    
    // Clean up subscription
    return () => {
      unsubscribe();
    };
  }, [roomId, onMessage, currentUsername]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Add to local state immediately
    const newMsg = {
      id: Date.now().toString(),
      sender: currentUsername,
      text: newMessage,
      isSystem: false
    };
    
    setMessages(prevMessages => [...prevMessages, newMsg]);
      // Generate a unique request ID
    const requestId = generateRequestId();
    
    // Send through WebSocket
    const chatMessage = {
      eventType: MessageType.CHAT_MESSAGE,
      requestId: requestId,
      Message: newMessage,
      Username: currentUsername,
      RoomId: roomId,
      Timestamp: new Date().toISOString()
    };
    
    send(chatMessage);
    
    // Call the callback if provided
    if (onSendMessage) {
      onSendMessage(newMessage);
    }
    
    // Clear the input
    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        Chat
      </div>
      <div className="chat-messages">
        {allMessages.map(msg => (
          <div 
            key={msg.id} 
            className={`chat-message ${msg.isSystem ? 'system-message' : ''} ${msg.sender === currentUsername ? 'my-message' : ''}`}
          >
            {!msg.isSystem && <div className="message-sender">{msg.sender}</div>}
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
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