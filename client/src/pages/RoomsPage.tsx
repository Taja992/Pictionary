import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import './RoomsPage.css';

interface Room {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
}

export default function RoomsPage() {
  const navigate = useNavigate();
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
    navigate(`/rooms/${newRoomId}`);
  };

  return (
    <div className="rooms-container">
      <div className="rooms-header">
        <h1 className="rooms-title">Game Rooms</h1>
        <button className="btn btn-primary" onClick={handleCreateRoom}>Create Room</button>
      </div>
      
      <div className="rooms-grid">
        {rooms.map((room) => (
          <div key={room.id} className="room-card">
            <div className="card-body">
              <h2 className="card-title">{room.name}</h2>
              <p className="card-info">Players: {room.playerCount}/{room.maxPlayers}</p>
              <div className="card-actions">
                <Link 
                  to={`/rooms/${room.id}`} 
                  className="btn btn-sm btn-primary"
                >
                  Join
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}