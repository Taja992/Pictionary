import React, { useEffect, useRef, useCallback } from 'react';
import { useAtom } from 'jotai';
import { useWsClient } from 'ws-request-hook';
import {
  currentGameAtom, userAtom, isDrawerAtom, 
  roomPlayersAtom, gamePlayersAtom, systemMessagesAtom 
} from '../atoms';

import { DrawerSelectedEvent, DrawerWordEvent, GameCreatedEvent, GameEndedEvent, GameStartedEvent, JoinedGameEvent, MessageType, RoomAction, RoomJoinDto, RoomLeaveDto, RoomUpdateDto, RoundEndedEvent, RoundStartedEvent } from './websocket-types';
import api from './api';

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
  
  // Get the client with all its functions
  const { 
    send,
    readyState,
    onMessage
  } = useWsClient();

  // Helper function to generate request IDs
  const generateRequestId = useCallback(() => {
    return Math.random().toString(36).substring(2, 15);
  }, []);

  // Add at the beginning of your component:
  useEffect(() => {
    // Clear system messages when first entering a room
    setSystemMessages([]);

    // Also clear messages when leaving the room
    return () => {
      setSystemMessages([]);
    };
  }, [roomId, setSystemMessages]);

  // Handle room join/leave
  useEffect(() => {
    if (!roomId || !user.username || !user.id || readyState !== 1) return;

    // Reset navigation flag
    isNavigatingAwayRef.current = false;
    
    const joinRoom = async () => {
      try {
        if (hasJoinedRef.current) return;
        
        console.log(`Joining room ${roomId} with user ${user.id}`);
        
        const joinRoomMessage: RoomJoinDto = {
          eventType: MessageType.ROOM_JOIN,
          requestId: generateRequestId(),
          RoomId: roomId,
          UserId: user.id,
          Username: user.username || 'Anonymous'
        };
        
        send(joinRoomMessage);
        hasJoinedRef.current = true;
        setTimeout(() => {
          if (roomId && user.id) {
            api.api.roomGetRoom(roomId)
              .then(response => {
                if (response.data.currentGameId) {
                  console.log('Room has an active game, adding self to game players');
                  setGamePlayers(prev => {
                    // Don't add if already in the list
                    if (prev.some(p => p.id === user.id)) {
                      return prev;
                    }
                    return [...prev, {
                      id: user.id,
                      name: user.username || 'Anonymous',
                      isOnline: true
                    }];
                  });
                }
              })
              .catch(err => {
                console.error('Error checking game status after join:', err);
              });
          }
        }, 500); // Small delay to ensure server has processed the join
      } catch (err) {
        console.error('Failed to join room:', err);
      }
    };

    joinRoom();

    // Handle page close/refresh
    const handleBeforeUnload = () => {
      if (readyState === 1) {
        isNavigatingAwayRef.current = true;
        
        const leaveRoomMessage: RoomLeaveDto = {
          eventType: MessageType.ROOM_LEAVE,
          requestId: generateRequestId(),
          RoomId: roomId,
          UserId: user.id,
          Username: user.username || 'Anonymous'
        };
        
        send(leaveRoomMessage);
        hasJoinedRef.current = false;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (readyState === 1) {
        const isRealNavigation = window.location.pathname !== `/rooms/${roomId}`;
        
        if (isRealNavigation || isNavigatingAwayRef.current) {
          console.log(`Leaving room ${roomId}`);
          
          const leaveRoomMessage: RoomLeaveDto = {
            eventType: MessageType.ROOM_LEAVE,
            requestId: generateRequestId(),
            RoomId: roomId,
            UserId: user.id,
            Username: user.username || 'Anonymous'
          };
          
          send(leaveRoomMessage);
          hasJoinedRef.current = false;
        }
      }
    };
  }, [roomId, user.id, user.username, readyState, send, generateRequestId]);

  // Setup message handling
  useEffect(() => {
    if (readyState !== 1 || !roomId) return;
    
    // Setup all the message handlers
    const unsubscribeHandlers: (() => void)[] = [];

    // Game created handler
    const unsubGameCreated = onMessage<GameCreatedEvent>(
      MessageType.GAME_CREATED,
      (message) => {
        console.log('Game created:', message);
        setCurrentGame({
          id: message.GameId,
          status: message.Status,
          currentRound: 0,
          totalRounds: message.TotalRounds,
          roundTimeSeconds: message.TimePerRound,
          roomId: roomId,
          startTime: new Date().toISOString(),
          roundStartTime: null,
          endTime: null,
          currentDrawerId: null,
          currentWord: null,
          scores: []
        });
      }
    );
    unsubscribeHandlers.push(unsubGameCreated);

    // Game started handler
    const unsubGameStarted = onMessage<GameStartedEvent>(
      MessageType.GAME_STARTED,
      (message) => {
        console.log('Game started:', message);
        setCurrentGame(prev => prev ? {
          ...prev,
          status: 'Playing',
          currentRound: message.CurrentRound
        } : null);
        
        // Properly copy room players to game players
        setGamePlayers([...roomPlayers]);
      }
    );
    unsubscribeHandlers.push(unsubGameStarted);

    // Round started handler
    const unsubRoundStarted = onMessage<RoundStartedEvent>(
      MessageType.ROUND_STARTED,
      (message) => {
        console.log('Round started:', message);
        setCurrentGame(prev => prev ? {
          ...prev,
          status: 'Drawing',
          currentRound: message.RoundNumber,
          currentDrawerId: message.DrawerId,
          roundStartTime: message.StartTime,
          roundTimeSeconds: message.DurationSeconds
        } : null);
        
        setIsDrawer(message.DrawerId === user.id);
      }
    );
    unsubscribeHandlers.push(unsubRoundStarted);

    // Drawer selected handler
    const unsubDrawerSelected = onMessage<DrawerSelectedEvent>(
      MessageType.DRAWER_SELECTED,
      (message) => {
        console.log('Drawer selected:', message);
        setCurrentGame(prev => prev ? {
          ...prev,
          currentDrawerId: message.DrawerId
        } : null);
        
        setIsDrawer(message.DrawerId === user.id);
      }
    );
    unsubscribeHandlers.push(unsubDrawerSelected);

    // Drawer word handler
    const unsubDrawerWord = onMessage<DrawerWordEvent>(
      MessageType.DRAWER_WORD,
      (message) => {
        console.log('Drawer word received');
        if (isDrawer) {
          setCurrentGame(prev => prev ? {
            ...prev,
            currentWord: message.Word
          } : null);
        }
      }
    );
    unsubscribeHandlers.push(unsubDrawerWord);

    // Round ended handler
    const unsubRoundEnded = onMessage<RoundEndedEvent>(
      MessageType.ROUND_ENDED,
      (message) => {
        console.log('Round ended:', message);
        setCurrentGame(prev => prev ? {
          ...prev,
          status: 'RoundEnd',
          currentWord: null,
          currentDrawerId: null
        } : null);
        
        setIsDrawer(false);
      }
    );
    unsubscribeHandlers.push(unsubRoundEnded);

    const unsubGameJoined = onMessage<JoinedGameEvent>(
      MessageType.GAME_JOINED,
      (message) => {
        console.log('Player joined game:', message);

        setGamePlayers(prev => {
          if (prev.some(p => p.id === message.UserId)) {
            return prev;
          }
          return [...prev, {
            id: message.UserId,
            name: message.Username,
            isOnlline: true
          }]
        })
      });
      unsubscribeHandlers.push(unsubGameJoined);


    // Game ended handler
    const unsubGameEnded = onMessage<GameEndedEvent>(
      MessageType.GAME_ENDED,
      (message) => {
        console.log('Game ended:', message);
        setCurrentGame(prev => prev ? {
          ...prev,
          status: message.Status,
          currentDrawerId: null,
          currentWord: null,
          endTime: new Date().toISOString()
        } : null);
        
        setIsDrawer(false);
      }
    );
    unsubscribeHandlers.push(unsubGameEnded);

    // Room update handler
    const unsubRoomUpdate = onMessage<RoomUpdateDto>(
      MessageType.ROOM_UPDATE,
      (message) => {
        // Handle room join
        if (message.Action === RoomAction.Joined) {
          setRoomPlayers(prev => {
            if (!prev.some(p => p.id === message.UserId)) {
              return [...prev, {
                id: message.UserId,
                name: message.Username
              }];
            }
            return prev;
          });
          
          setSystemMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: `${message.Username} joined the room`,
            timestamp: new Date(),
            type: 'join'
          }]);
        } 
        // Handle room leave
        else if (message.Action === RoomAction.Left) {
          setRoomPlayers(prev => prev.filter(p => p.id !== message.UserId));
          
          setSystemMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: `${message.Username} left the room`,
            timestamp: new Date(),
            type: 'leave'
          }]);
        }
      }
    );
    unsubscribeHandlers.push(unsubRoomUpdate);

    // Cleanup all subscriptions
    return () => {
      unsubscribeHandlers.forEach(unsub => unsub());
    };
  }, [
    readyState, roomId, user.id, isDrawer, onMessage,
    setCurrentGame, setIsDrawer, roomPlayers, 
    setGamePlayers, setRoomPlayers, setSystemMessages
  ]);

  return <>{children}</>;
}