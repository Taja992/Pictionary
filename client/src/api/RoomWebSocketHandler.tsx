import React, { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { useWsClient } from 'ws-request-hook';
import {
  currentGameAtom, userAtom, isDrawerAtom, 
  roomPlayersAtom, gamePlayersAtom, systemMessagesAtom,
  endRoundWordAtom
} from '../atoms';

import { DrawerSelectedEvent, DrawerWordEvent,
   GameCreatedEvent, GameEndedEvent,
    GameStartedEvent, JoinedGameEvent,
     MessageType, RoomAction, RoomJoinDto,
      RoomLeaveDto, RoomUpdateDto,
       RoundEndedEvent, RoundStartedEvent,
      ScoreUpdatedEvent } from './websocket-types';
import { generateRequestId } from './index';
import api from './api';

interface RoomWebSocketHandlerProps {
  children?: React.ReactNode;
  roomId: string;
}

export default function RoomWebSocketHandler({ children, roomId }: RoomWebSocketHandlerProps) {
  const [user] = useAtom(userAtom);
  const [, setCurrentGame] = useAtom(currentGameAtom);
  const [roomPlayers, setRoomPlayers] = useAtom(roomPlayersAtom);
  const [, setGamePlayers] = useAtom(gamePlayersAtom);
  const [, setSystemMessages] = useAtom(systemMessagesAtom);
  const hasJoinedRef = useRef(false);
  const isNavigatingAwayRef = useRef(false);
  const [, setLastRoundWord] = useAtom(endRoundWordAtom);
  const [isDrawer] = useAtom(isDrawerAtom);  // Get the client with all its functions
  const {send, readyState, onMessage} = useWsClient();


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
                    console.log('Room has an active game, checking if player is already in game players list');

                    // Get current game data to check if player needs to be added
                    api.api.gameOrchestrationGetCurrentGameForRoom(roomId)
                        .then(gameResponse => {
                          // Check if the user is already in the game players list
                          const userInGamePlayers = gameResponse.data.scores?.some(
                              (score: any) => score.userId === user.id
                          );

                          // Only add the user if not already in scores list
                          if (!userInGamePlayers) {
                            setGamePlayers(prev => {
                              // Don't add if already in the list
                              if (prev.some(p => p.id === user.id)) {
                                return prev;
                              }
                              return [...prev, {
                                id: user.id,
                                name: user.username || 'Anonymous',
                                isOnline: true,
                                totalPoints: 0,
                                lastPointsGained: 0,
                                lastScoreTime: undefined
                              }];
                            });
                          }
                        })
                        .catch(err => {
                          console.error('Error fetching game details:', err);
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
  }, [roomId, user.id, user.username, readyState, send]);

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
          // copy room players to game players with game-specific properties
        setGamePlayers(roomPlayers.map(player => ({
          ...player,
          totalPoints: 0,
          lastPointsGained: undefined,
          lastScoreTime: undefined
        })));
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
        setLastRoundWord(message.CurrentWord || null);
        setCurrentGame(prev => prev ? {
          ...prev,
          status: 'RoundEnd',
          currentDrawerId: null
        } : null);
        
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
            isOnline: true,
            totalPoints: 0
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
          endTime: new Date().toISOString()
        } : null);
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
                name: message.Username,
                isOnline: true
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

    // Score update handler
    const unsubScoreUpdated = onMessage<ScoreUpdatedEvent>(
      MessageType.SCORE_UPDATED,
      (message) => {
        console.log('Score updated:', message);

        
        // Update the game players with the new score
        setGamePlayers(prev => {
          // Make a copy of the players array
          const updatedPlayers = [...prev];
          
          // Find the player who scored
          const playerIndex = updatedPlayers.findIndex(p => p.id === message.UserId);
          
          if (playerIndex >= 0) {
            // Player exists, update their score
            updatedPlayers[playerIndex] = {
              ...updatedPlayers[playerIndex],
              totalPoints: message.TotalPoints,
              lastPointsGained: message.PointsGained,
              lastScoreTime: new Date()
            };
          } else {
            // Player doesn't exist in the list (rare case)
            // Find their name from roomPlayers
            const playerName = roomPlayers.find(p => p.id === message.UserId)?.name || 'Unknown';
            
            // Add them to the list
            updatedPlayers.push({
              id: message.UserId,
              name: playerName,
              isOnline: true,
              totalPoints: message.TotalPoints,
              lastPointsGained: message.PointsGained,
              lastScoreTime: new Date()
            });
          }
          
          // Sort by total points (highest first)
          return updatedPlayers.sort((a, b) => 
            (b.totalPoints || 0) - (a.totalPoints || 0)
          );
        });
        
       
        setSystemMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `${roomPlayers.find(p => p.id === message.UserId)?.name || 'Someone'} guessed correctly! (+${message.PointsGained} points)`,
          timestamp: new Date(),
          type: 'join' // Reusing 'join' type as it's typically green/positive
        }]);
      }
    );
    unsubscribeHandlers.push(unsubScoreUpdated);

    // Cleanup all subscriptions
    return () => {
      unsubscribeHandlers.forEach(unsub => unsub());
    };
  }, [
    readyState, roomId, user.id, isDrawer, onMessage,
    setCurrentGame,
    roomPlayers,
    setGamePlayers, setRoomPlayers, setSystemMessages
  ]);

  

  return <>{children}</>;
}