import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { websocketClient } from './websocket-client';
import { userAtom, webSocketStatusAtom } from '../atoms';

interface WebSocketProviderProps {
  children: React.ReactNode;
  roomId?: string;
}

export default function WebSocketProvider({ children, roomId }: WebSocketProviderProps) {
  const [user] = useAtom(userAtom);
  const [wsStatus] = useAtom(webSocketStatusAtom);

  // Handle WebSocket connection
  useEffect(() => {
    if (roomId && user.name) {
      // Connect to WebSocket if not connected or reconnecting if needed
      if (wsStatus === 'disconnected' || wsStatus === 'error') {
        websocketClient.connect().then(() => {
          websocketClient.joinRoom(roomId, user.name || 'Anonymous');
        }).catch(err => {
          console.error('Failed to connect to WebSocket server:', err);
        });
      } else if (wsStatus === 'connected') {
        // If already connected, just join the room
        websocketClient.joinRoom(roomId, user.name || 'Anonymous');
      }
    }
    
    // Clean up on unmount
    return () => {
      // Don't disconnect here, as the socket might be used elsewhere
    };
  }, [roomId, user.name, wsStatus]);

  return <>{children}</>;
}