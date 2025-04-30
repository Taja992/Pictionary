import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { roomsListAtom, userAtom } from '../atoms';
import api from '../api/api';
import RoomCard from '../components/Lobby/RoomCard';
import '../components/Lobby/lobby.css';
import toast from 'react-hot-toast';
import CreateRoomButton from '../components/Lobby/CreateRoomButton';
import LobbyWebSocketHandler from '../api/LobbyWebSocketHandler';
import { useNavigate } from 'react-router-dom';

export default function LobbyPage() {
  const [rooms, setRooms] = useAtom(roomsListAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [user] = useAtom(userAtom);
  const navigate = useNavigate();


  useEffect(() => {
    if (!user.id || !user.username) {
      toast.error('Please enter a username to play');
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch all rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const response = await api.api.roomGetRooms();
        setRooms(response.data);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        toast.error('Failed to fetch rooms. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [setRooms]);
  
  return (
    <LobbyWebSocketHandler>
    <div className="lobby-container">
      <div className="lobby-header">
        <h1 className="lobby-title">Game Rooms</h1>
        <CreateRoomButton />
      </div>
      
      {isLoading && rooms.length === 0 ? (
        <div className="loading-container">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="empty-rooms">
          <p>No active game rooms. Create a new room to start playing!</p>
          <CreateRoomButton className="mt-4" />
        </div>
      ) : (
        <div className="rooms-list">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              id={room.id || ''}
              name={room.name || ''}
              playerCount={room.playerCount || 0}
              maxPlayers={room.maxPlayers || 8}
              isPrivate={room.isPrivate ?? false}
              players={room.players || []}
            />
          ))}
        </div>
      )}
    </div>
    </LobbyWebSocketHandler>
  );
}