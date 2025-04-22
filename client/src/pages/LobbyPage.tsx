import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { roomsListAtom, userAtom } from '../atoms';
import api from '../api/api';
import { CreateRoomRequest } from '../api/api-client';
import RoomCard from '../components/Lobby/RoomCard';
import { CreateRoom } from '../components/Lobby';
import '../components/lobby/lobby.css';
import toast from 'react-hot-toast';

export default function LobbyPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useAtom(roomsListAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [user] = useAtom(userAtom);

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
    
    // Optional: Add polling to refresh rooms every 10 seconds
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, [setRooms]);

  const handleCreateRoom = () => {
    // Check if user is logged in
    if (!user.username) {
      toast.error('Please enter a username before creating a room');
      navigate('/');
      return;
    }
    setShowCreateModal(true);
  };
  
  const handleCreateRoomSubmit = async (request: CreateRoomRequest) => {
    try {
      setIsLoading(true);
      
      const response = await api.api.roomCreateRoom(request);
      const newRoom = response.data;
      
      // Add the new room to the list
      setRooms(prevRooms => [...prevRooms, newRoom]);
      
      // Close modal
      setShowCreateModal(false);
      
      // Show success message
      toast.success('Room created successfully!');
      
      // Navigate to the new room
      navigate(`/games/${newRoom.id}`);
      
    } catch (err) {
      console.error('Error creating room:', err);
      toast.error('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <h1 className="lobby-title">Game Rooms</h1>
        <button className="btn btn-primary" onClick={handleCreateRoom}>
          Create Room
        </button>
      </div>
      
      {isLoading && rooms.length === 0 ? (
        <div className="loading-container">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="empty-rooms">
          <p>No active game rooms. Create a new room to start playing!</p>
          <button 
            className="btn btn-primary mt-4" 
            onClick={handleCreateRoom}
          >
            Create Room
          </button>
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
      
      <CreateRoom
        isOpen={showCreateModal}
        isLoading={isLoading}
        username={user.username || ''}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRoomSubmit}
      />
    </div>
  );
}