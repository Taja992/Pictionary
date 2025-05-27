import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import {  userAtom } from '../../atoms';
import { api, CreateRoomRequest} from '../../api';
import { CreateRoom } from '.';
import toast from 'react-hot-toast';

interface CreateRoomButtonProps {
  className?: string;
}

export default function CreateRoomButton({ className = '' }: CreateRoomButtonProps) {
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

      if (!user.id) {
        toast.error('User information missing. Please reload the page.');
        return;
      }

      const requestWithUserId = {
        ...request,
        ownerId: user.id
      };

      console.log('Creating room with user ID:', user.id);
      
      const response = await api.api.roomCreateRoom(requestWithUserId);
      const newRoom = response.data;
      
      // Close modal
      setShowCreateModal(false);
      
      toast.success('Room created successfully!');
      
      // Navigate to the new room
      navigate(`/rooms/${newRoom.id}`);
      
    } catch (err) {
      console.error('Error creating room:', err);
      toast.error('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        className={`btn btn-primary ${className}`} 
        onClick={handleCreateRoom}
      >
        Create Room
      </button>
      
      <CreateRoom
        isOpen={showCreateModal}
        isLoading={isLoading}
        username={user.username || ''}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRoomSubmit}
      />
    </>
  );
}