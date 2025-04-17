import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { navigationStateAtom, currentGameAtom } from '../atoms';
import { ROUTES } from '../routes';
import {
  RoomsContainer,
  RoomsHeader,
  RoomsGrid
} from '../components/Lobby';
import '../components/lobby/lobby.css';

interface Room {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
}

export default function LobbyPage() {
  const navigate = useNavigate();
  const [, setNavState] = useAtom(navigationStateAtom);
  const [currentGame, setCurrentGame] = useAtom(currentGameAtom);
  
  // Mock data - will later be fetched from your API
  const [rooms] = useState<Room[]>([
    { id: '1', name: 'Fun Room', playerCount: 3, maxPlayers: 8 },
    { id: '2', name: 'Pros Only', playerCount: 5, maxPlayers: 6 },
    { id: '3', name: 'Casual Game', playerCount: 2, maxPlayers: 10 }
  ]);
  
  const handleCreateRoom = () => {
    // In a real app, you'd call an API to create a room
    // For now, we'll just simulate creating a room with a random ID
    const newRoomId = Math.floor(Math.random() * 10000).toString();
    
    // Update current game state
    setCurrentGame({
      ...currentGame,
      roomId: newRoomId,
      status: 'waiting'
    });
    
    // Update navigation state
    setNavState({
      previousRoute: ROUTES.ROOMS,
      currentRoute: `/rooms/${newRoomId}`
    });
    
    navigate(`/rooms/${newRoomId}`);
  };

  const handleJoinRoom = (roomId: string) => {
    // Update current game state
    setCurrentGame({
      ...currentGame,
      roomId: roomId,
      status: 'waiting'
    });
    
    // Update navigation state
    setNavState({
      previousRoute: ROUTES.ROOMS,
      currentRoute: `/rooms/${roomId}`
    });
    
    navigate(`/rooms/${roomId}`);
  };

  return (
    <RoomsContainer>
      <RoomsHeader onCreateRoom={handleCreateRoom} />
      <RoomsGrid rooms={rooms} onJoinRoom={handleJoinRoom} />
    </RoomsContainer>
  );
}