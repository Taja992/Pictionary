import React, { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { websocketClient } from './websocket-client';
import {
  currentGameAtom, userAtom, isDrawerAtom, 
  roomPlayersAtom, gamePlayersAtom, systemMessagesAtom 
} from '../atoms';
import {
  DrawerSelectedEvent, DrawerWordEvent, GameCreatedEvent, GameEndedEvent,
  GameStartedEvent, MessageType, RoundEndedEvent, RoundStartedEvent,
  RoomUpdateDto, RoomAction
} from './websocket-types';

interface RoomWebSocketHandlerProps {
  children?: React.ReactNode;
  roomId: string;
}

export default function RoomWebSocketHandler({ children, roomId }: RoomWebSocketHandlerProps) {
  const [user] = useAtom(userAtom);
  const [, setCurrentGame] = useAtom(currentGameAtom);
  const [isDrawer, setIsDrawer] = useAtom(isDrawerAtom);
  const [roomPlayers, setRoomPlayers] = useAtom(roomPlayersAtom);
  const [, setGamePlayers] = useAtom(gamePlayersAtom);
  const [, setSystemMessages] = useAtom(systemMessagesAtom);
  const hasJoinedRef = useRef(false);
  const isNavigatingAwayRef = useRef(false);

  // Handle room join/leave
  useEffect(() => {
    if (!roomId || !user.username || !user.id || !websocketClient.connected) return;

    // Reset navigation flag
    isNavigatingAwayRef.current = false;
    
    const joinRoom = async () => {
      try {
        if (hasJoinedRef.current) return;
        
        console.log(`Joining room ${roomId} with user ${user.id}`);
        websocketClient.roomJoin(roomId, user.id, user.username || 'Anonymous');
        hasJoinedRef.current = true;
      } catch (err) {
        console.error('Failed to join room:', err);
      }
    };

    joinRoom();

    // Handle page close/refresh
    const handleBeforeUnload = () => {
      if (websocketClient.connected) {
        isNavigatingAwayRef.current = true;
        websocketClient.roomLeave(roomId, user.id, user.username);
        hasJoinedRef.current = false;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (websocketClient.connected) {
        const isRealNavigation = window.location.pathname !== `/rooms/${roomId}`;
        
        if (isRealNavigation || isNavigatingAwayRef.current) {
          console.log(`Leaving room ${roomId}`);
          websocketClient.roomLeave(roomId, user.id, user.username);
          hasJoinedRef.current = false;
        }
      }
    };
  }, [roomId, user.id, user.username]);

  useEffect(() => {
    if (!roomId) return;

    const handleGameCreated = (data: GameCreatedEvent) => {
      console.log('Game created:', data);
      setCurrentGame({
        id: data.GameId,
        status: data.Status,
        currentRound: 0,
        totalRounds: data.TotalRounds,
        roundTimeSeconds: data.TimePerRound,
        roomId: roomId,
        startTime: new Date().toISOString(),
        roundStartTime: null,
        endTime: null,
        currentDrawerId: null,
        currentWord: null,
        scores: []
      });
    };

    const handleGameStarted = (data: GameStartedEvent) => {
      console.log('Game started:', data);
      setCurrentGame(prev => prev ? {
        ...prev,
        status: 'Playing',
        currentRound: data.CurrentRound
      } : null);
      
      // Properly copy room players to game players
      setGamePlayers([...roomPlayers]);
    };

    const handleRoundStarted = (data: RoundStartedEvent) => {
      console.log('Round started:', data);
      setCurrentGame(prev => prev ? {
        ...prev,
        status: 'Drawing',
        currentRound: data.RoundNumber,
        currentDrawerId: data.DrawerId,
        roundStartTime: data.StartTime,
        roundTimeSeconds: data.DurationSeconds
      } : null);

      setIsDrawer(data.DrawerId === user.id);
    };

    const handleDrawerSelected = (data: DrawerSelectedEvent) => {
      console.log('Drawer selected:', data);
      setCurrentGame(prev => prev ? {
        ...prev,
        currentDrawerId: data.DrawerId
      } : null);

      setIsDrawer(data.DrawerId === user.id);
    };

    const handleDrawerWord = (data: DrawerWordEvent) => {
      console.log('Drawer word received');
      if (isDrawer) {
        setCurrentGame(prev => prev ? {
          ...prev,
          currentWord: data.Word
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
        status: data.Status,
        currentDrawerId: null,
        currentWord: null,
        endTime: new Date().toISOString()
      } : null);

      setIsDrawer(false);
    };

    // Register handlers
    websocketClient.on(MessageType.GAME_CREATED, handleGameCreated);
    websocketClient.on(MessageType.GAME_STARTED, handleGameStarted);
    websocketClient.on(MessageType.ROUND_STARTED, handleRoundStarted);
    websocketClient.on(MessageType.DRAWER_SELECTED, handleDrawerSelected);
    websocketClient.on(MessageType.DRAWER_WORD, handleDrawerWord);
    websocketClient.on(MessageType.ROUND_ENDED, handleRoundEnded);
    websocketClient.on(MessageType.GAME_ENDED, handleGameEnded);

    return () => {
      // Cleanup handlers
      websocketClient.off(MessageType.GAME_CREATED, handleGameCreated);
      websocketClient.off(MessageType.GAME_STARTED, handleGameStarted);
      websocketClient.off(MessageType.ROUND_STARTED, handleRoundStarted);
      websocketClient.off(MessageType.DRAWER_SELECTED, handleDrawerSelected);
      websocketClient.off(MessageType.DRAWER_WORD, handleDrawerWord);
      websocketClient.off(MessageType.ROUND_ENDED, handleRoundEnded);
      websocketClient.off(MessageType.GAME_ENDED, handleGameEnded);
    };
  }, [roomId, user.id, isDrawer, setCurrentGame, setIsDrawer, roomPlayers, setGamePlayers]);

  // Handle room player updates
  useEffect(() => {
    if (!roomId) return;

    const handleRoomUpdate = (data: RoomUpdateDto) => {
      // Handle room join
      if (data.Action === RoomAction.Joined) {
        setRoomPlayers(prev => {
          if (!prev.some(p => p.id === data.UserId)) {
            return [...prev, {
              id: data.UserId,
              name: data.Username
            }];
          }
          return prev;
        });

        setSystemMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `${data.Username} joined the room`,
          timestamp: new Date(),
          type: 'join'
        }]);
      } 
      // Handle room leave
      else if (data.Action === RoomAction.Left) {
        setRoomPlayers(prev => prev.filter(p => p.id !== data.UserId));

        setSystemMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `${data.Username} left the room`,
          timestamp: new Date(),
          type: 'leave'
        }]);
      }
    };

    // Register room update handler
    websocketClient.on(MessageType.ROOM_UPDATE, handleRoomUpdate);

    return () => {
      // Remove the handler
      websocketClient.off(MessageType.ROOM_UPDATE, handleRoomUpdate);
    };
  }, [roomId, setRoomPlayers, setSystemMessages]);

  return <>{children}</>;
}