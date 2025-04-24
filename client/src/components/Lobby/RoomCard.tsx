import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { currentRoomAtom, userAtom } from '../../atoms';
import api from '../../api/api';
import toast from 'react-hot-toast';

interface RoomCardProps {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  isPrivate: boolean;
  players: Array<{ id?: string; name?: string }>;
}

export default function RoomCard({ 
  id, 
  name, 
  playerCount, 
  maxPlayers, 
  isPrivate,
  players 
}: RoomCardProps) {
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);
  const [, setCurrentRoom] = useAtom(currentRoomAtom);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');

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

    // If room is private, show password input, otherwise join directly
    if (isPrivate) {
      setShowPasswordInput(true);
    } else {
      joinRoom();
    }
  };

  const joinRoom = async (passwordToUse?: string) => {
    try {
      setIsLoading(true);

      // Join the room with or without password
      const userId = user.id || '';
      
      // Set joinGame to false to avoid redundancy with WebSocketProvider
      await api.api.roomJoinRoom(id, { 
        userId, 
        password: passwordToUse || null,
        joinGame: false  // Change to false
      });
      
      // Get room details after joining
      const roomResponse = await api.api.roomGetRoom(id);
      setCurrentRoom(roomResponse.data);
      
      // Navigate to game room
      navigate(`/rooms/${id}`);
      
    } catch (err) {
      console.error('Error joining room:', err);
      toast.error('Failed to join room. Please check your password and try again.');
      // Keep password input open if there was an error with a private room
      if (!isPrivate) {
        setShowPasswordInput(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    joinRoom(password);
  };

  const handleCancelPassword = () => {
    setShowPasswordInput(false);
    setPassword('');
  };

  const isFull = playerCount >= maxPlayers;

  return (
    <div className="room-card">
      <div className="card-body">
        <h2 className="card-title">{name}</h2>
        <p className="card-info">
          Players: {playerCount}/{maxPlayers}
          {isPrivate && <span className="private-badge"> 🔒 Private</span>}
        </p>
        
        {/* Password input overlay */}
        {showPasswordInput ? (
          <div className="password-form">
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter room password"
                className="password-input"
                autoFocus
                required
              />
              <div className="password-actions">
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline" 
                  onClick={handleCancelPassword}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-sm btn-primary"
                  disabled={isLoading || !password.trim()}
                >
                  {isLoading ? 'Joining...' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card-actions">
            <button 
              onClick={handleJoinClick}
              className="btn btn-sm btn-primary"
              disabled={isFull || isLoading}
            >
              {isLoading ? 'Joining...' : isFull ? 'Full' : 'Join'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}