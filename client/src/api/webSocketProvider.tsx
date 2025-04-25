import React, { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { websocketClient } from './websocket-client';
import {currentGameAtom, userAtom, webSocketStatusAtom, isDrawerAtom } from '../atoms';
import {DrawerSelectedEvent, DrawerWordEvent, GameCreatedEvent, GameEndedEvent,
  GameStartedEvent, MessageType, RoundEndedEvent, RoundStartedEvent } from './websocket-types';

interface WebSocketProviderProps {
  children: React.ReactNode;
  roomId?: string;
}

export default function WebSocketProvider({ children, roomId }: WebSocketProviderProps) {
  
  const [user] = useAtom(userAtom);
  const [wsStatus] = useAtom(webSocketStatusAtom);
  const [, setCurrentGame] = useAtom(currentGameAtom);
  const [isDrawer, setIsDrawer] = useAtom(isDrawerAtom);
  
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

  useEffect(() => {
    if (!roomId) return;

    const handleGameCreated = (data: GameCreatedEvent) => {
      console.log('Game created:', data);
      setCurrentGame({
        id: data.gameId,
        status: data.status,
        currentRound: 0,
        totalRounds: data.totalRounds,
        roundTimeSeconds: data.timePerRound,
        roomId: roomId,
        startTime: new Date().toISOString(),
        roundStartTime: null,
        endTime: null,
        currentDrawerId: null,
        currentWord: null, // Adjust field name based on your DTO
        scores: []
      });
    };

    const handleGameStarted = (data: GameStartedEvent) => {
      console.log('Game started:', data);
      setCurrentGame(prev => prev ? {
        ...prev,
        status: 'Playing',
        currentRound: data.currentRound
      } : null);
    };

    const handleRoundStarted = (data: RoundStartedEvent) => {
      console.log('Round started:', data);
      setCurrentGame(prev => prev ? {
        ...prev,
        status: 'Drawing',
        currentRound: data.roundNumber,
        currentDrawerId: data.drawerId,
        roundStartTime: data.startTime,
        roundTimeSeconds: data.durationSeconds
      } : null);

      setIsDrawer(data.drawerId === user.id);
    };

    const handleDrawerSelected = (data: DrawerSelectedEvent) => {
      console.log('Drawer selected:', data);
      setCurrentGame(prev => prev ? {
        ...prev,
        currentDrawerId: data.drawerId
      } : null);

      setIsDrawer(data.drawerId === user.id);
    };

    const handleDrawerWord = (data: DrawerWordEvent) => {
      console.log('Drawer word received');
      if (isDrawer) {
        setCurrentGame(prev => prev ? {
          ...prev,
          currentWord: data.word // Adjust field name based on your DTO
        } : null);
      }
    };

    const handleRoundEnded = (data: RoundEndedEvent) => {
      console.log('Round ended:', data);
      setCurrentGame(prev => prev ? {
        ...prev,
        status: 'RoundEnd',
        currentWord: null,
        currentDrawerId: null
      } : null);

      setIsDrawer(false);
    };

    const handleGameEnded = (data: GameEndedEvent) => {
      console.log('Game ended:', data);
      setCurrentGame(prev => prev ? {
        ...prev,
        status: data.status,
        currentDrawerId: null,
        currentWord: null,
        endTime: new Date().toISOString()
      } : null);

      setIsDrawer(false);
    };

    // Register using the string literals from MessageType enum
    websocketClient.on(MessageType.GAME_CREATED, handleGameCreated);
    websocketClient.on(MessageType.GAME_STARTED, handleGameStarted);
    websocketClient.on(MessageType.ROUND_STARTED, handleRoundStarted);
    websocketClient.on(MessageType.DRAWER_SELECTED, handleDrawerSelected);
    websocketClient.on(MessageType.DRAWER_WORD, handleDrawerWord);
    websocketClient.on(MessageType.ROUND_ENDED, handleRoundEnded);
    websocketClient.on(MessageType.GAME_ENDED, handleGameEnded);

    return () => {
      websocketClient.off(MessageType.GAME_CREATED, handleGameCreated);
      websocketClient.off(MessageType.GAME_STARTED, handleGameStarted);
      websocketClient.off(MessageType.ROUND_STARTED, handleRoundStarted);
      websocketClient.off(MessageType.DRAWER_SELECTED, handleDrawerSelected);
      websocketClient.off(MessageType.DRAWER_WORD, handleDrawerWord);
      websocketClient.off(MessageType.ROUND_ENDED, handleRoundEnded);
      websocketClient.off(MessageType.GAME_ENDED, handleGameEnded);
    };
  }, [roomId, user.id, isDrawer, setCurrentGame, setIsDrawer]);

  return <>{children}</>;
}
