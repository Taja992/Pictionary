import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../../atoms';
import api from '../../api/api';
import toast from 'react-hot-toast';

interface CreateTempUserProps {
  onSuccess?: () => void;
}

export default function CreateTempUser({ onSuccess }: CreateTempUserProps) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setUser] = useAtom(userAtom);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Call the API to register a temporary user
      const response = await api.api.userRegisterTemporaryUser({ 
        username: username.trim() 
      });
      
      // Update the user atom with the response data
      setUser(response.data);
      
      // Save the username to localStorage for persistence
      localStorage.setItem('username', username.trim());
      
      // Show success message
      toast.success(`Welcome, ${username}!`);
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to register user:', error);
      toast.error('Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="home-form">
      <div className="form-control">
        <label className="label">
          <span className="label-text">What's your name?</span>
        </label>
        <input 
          type="text" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input input-bordered name-input" 
          placeholder="Enter your name"
          maxLength={20}
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="button-group">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={!username.trim() || isLoading}
        >
          {isLoading ? 'Loading...' : 'Play!'}
        </button>
      </div>
    </form>
  );
}