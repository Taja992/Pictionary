import React, { useEffect, useRef } from 'react';
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
  const hasJoinedRef = useRef(false);
  const isNavigatingAwayRef = useRef(false);

  // Handle WebSocket connection and room join
  useEffect(() => {
    if (!roomId || !user.username || !user.id) return;
    
    // Reset navigation flag when joining a room
    isNavigatingAwayRef.current = false;
    
    const connectAndJoin = async () => {
      try {
        // If already joined, don't join again
        if (hasJoinedRef.current) {
          return;
        }
        
        // If not connected, connect first
        if (wsStatus === 'disconnected' || wsStatus === 'error') {
          await websocketClient.connect(user.id, user.username);
        }
        
        // Join the room if connected
        if (websocketClient.connected) {
          websocketClient.roomJoin(roomId, user.id, user.username || 'Anonymous');
          hasJoinedRef.current = true;
        }
      } catch (err) {
        console.error('Failed to connect or join room:', err);
      }
    };

    connectAndJoin();

    // Handle page close/refresh
    const handleBeforeUnload = () => {
      if (roomId && user.id && user.username && websocketClient.connected) {
        isNavigatingAwayRef.current = true;
        websocketClient.roomLeave(roomId, user.id, user.username);
        hasJoinedRef.current = false;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up function
    return () => {
      // Remove event listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Only leave the room if actually navigating away
      // This prevents leave room when component remounts during React's internal rerendering
      if (roomId && user.id && user.username && websocketClient.connected) {
        // Check if this is a real navigation away from the room
        // and not just a React rerender or StrictMode double-mount
        const isRealNavigation = window.location.pathname !== `/rooms/${roomId}`;
        
        if (isRealNavigation || isNavigatingAwayRef.current) {
          websocketClient.roomLeave(roomId, user.id, user.username);
          hasJoinedRef.current = false;
        } else {
          console.log(`Component cleanup but staying in room ${roomId}`);
        }
      }
    };
  }, [roomId, user.id, user.username, wsStatus]);


  return <>{children}</>;
}