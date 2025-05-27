import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { currentRoomAtom, userAtom } from '../../atoms';
import { api } from '../../api';
import toast from 'react-hot-toast';

interface RoomCardProps {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  players: Array<{ id?: string; name?: string }>;
}

export default function RoomCard({ 
  id, 
  name, 
  playerCount, 
  maxPlayers,
  players 
}: RoomCardProps) {
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);
  const [, setCurrentRoom] = useAtom(currentRoomAtom);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinClick = () => {
    // Check if user is logged in
    if (!user.username) {
      toast.error('Please enter a username before joining a room');
      navigate('/');
      return;
    }

    // Check if user is already in the room
    const isUserInRoom = players?.some(player => player.id === user.id);
    if (isUserInRoom) {
      navigate(`/rooms/${id}`);
      return;
    }

    // Join room directly
    joinRoom();
  };
  const joinRoom = async () => {
    try {
      setIsLoading(true);
      
      // Get room details after joining
      const roomResponse = await api.api.roomGetRoom(id);
      setCurrentRoom(roomResponse.data);
      
      // Navigate to game room
      navigate(`/rooms/${id}`);
      
    } catch (err) {
      console.error('Error joining room:', err);
      toast.error('Failed to join room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  const isFull = playerCount >= maxPlayers;
  return (
    <div className="room-card">
      <div className="card-body">
        <h2 className="card-title">{name}</h2>
        <p className="card-info">
          Players: {playerCount}/{maxPlayers}
        </p>

        <div className="card-actions">
          <button 
            onClick={handleJoinClick}
            className="btn btn-sm btn-primary"
            disabled={isFull || isLoading}
          >
            {isLoading ? 'Joining...' : isFull ? 'Full' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );
}