import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useWsClient } from 'ws-request-hook';
import { roomsListAtom } from '../atoms';
import { MessageType, RoomCreatedEvent, RoomDeletedEvent } from './websocket-types';
import { RoomDto, PlayerDto } from './api-client';

interface LobbyWebSocketHandlerProps {
  children?: React.ReactNode;
}

export default function LobbyWebSocketHandler({ children }: LobbyWebSocketHandlerProps) {
  const { onMessage, readyState } = useWsClient();
  const [, setRooms] = useAtom(roomsListAtom); 

  
  console.log("LobbyWebSocketHandler active, readyState:", readyState);

  // Setup message handling
  useEffect(() => {
    if (readyState !== 1) {
      console.log("WebSocket not connected, skipping message setup");
      return;
    }
    
    console.log("Setting up lobby WebSocket handlers");
    const unsubscribeHandlers: (() => void)[] = [];

    // Room created handler
    const unsubRoomCreated = onMessage<RoomCreatedEvent>(
      MessageType.ROOM_CREATED,
      (message) => {
        console.log('Room created event received:', message);
        
        // Add the new room to the rooms list
        setRooms(prevRooms => {
          // Check if room already exists
        const existingRoomIndex = prevRooms.findIndex(room => room.id === message.RoomId);
      
        if (existingRoomIndex >= 0) {
          console.log("Room already exists, skipping");
          return prevRooms;
        }
          
          console.log("Adding new room to list");
          
          // Create player entry for owner
          const ownerPlayer: PlayerDto = {
            id: message.OwnerId,
            name: message.OwnerName,
            isOnline: true
          };
          
          // Add new room using RoomDto
          const newRoom: RoomDto = {
            id: message.RoomId,
            name: message.RoomName,
            ownerId: message.OwnerId,
            ownerName: message.OwnerName,
            isPrivate: message.IsPrivate,
            players: [ownerPlayer],
            playerCount: 1,
            maxPlayers: 8, // Default value
            createdAt: new Date().toISOString(),
            status: 'Waiting',
            currentGameId: null
          };
          
          // Log current and new state
          console.log("Current rooms:", prevRooms);
          console.log("New room to add:", newRoom);
          
          return [...prevRooms, newRoom];
        });
      }
    );
    unsubscribeHandlers.push(unsubRoomCreated);

    // Room deleted handler
    const unsubRoomDeleted = onMessage<RoomDeletedEvent>(
      MessageType.ROOM_DELETED,
      (message) => {
        console.log('Room deleted:', message);
        
        // Remove the deleted room from the rooms list
        setRooms(prevRooms => prevRooms.filter(room => room.id !== message.RoomId));
      }
    );
    unsubscribeHandlers.push(unsubRoomDeleted);

    // Cleanup all subscriptions
    return () => {
      console.log("Cleaning up lobby WebSocket handlers");
      unsubscribeHandlers.forEach(unsub => unsub());
    };
  }, [readyState, onMessage, setRooms]);

  return <>{children}</>;
}