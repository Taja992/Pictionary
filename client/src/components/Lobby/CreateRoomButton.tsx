import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import {  userAtom } from '../../atoms';
import api from '../../api/api';
import { CreateRoomRequest } from '../../api/api-client';
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

      const storedUser = JSON.parse(localStorage.getItem('pictionary_user') || '{}');

      if (!storedUser.id) {
        toast.error('User information missing. Please reload the page.');
        return;
      }

      // Use the consistent user ID
      const requestWithUserId = {
        ...request,
        ownerId: storedUser.id  // Make sure this is included!
      };

      console.log('Creating room with user ID:', storedUser.id);
      
      const response = await api.api.roomCreateRoom(requestWithUserId);
      const newRoom = response.data;

      // Add the new room to the list
      //setRooms(prevRooms => [...prevRooms, newRoom]);
      
      // Close modal
      setShowCreateModal(false);
      
      // Show success message
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