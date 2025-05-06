import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../../atoms';
import { api } from '../../api';
import toast from 'react-hot-toast';

interface CreateTempUserProps {
  onSuccess?: () => void;
}

export default function CreateTempUser({ onSuccess }: CreateTempUserProps) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useAtom(userAtom);
  
  // If we already have a valid user, redirect immediately
  React.useEffect(() => {
    if (user.id && user.username && onSuccess) {
      console.log('User already exists, redirecting', user);
      onSuccess();
    }
  }, [user, onSuccess]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Call the API to register a temporary user
      const response = await api.api.userRegisterTemporaryUser({ 
        username: username.trim() 
      });
      
      console.log('Temporary user created:', response.data);
      
      // Update the user atom with the response data
      setUser({...response.data, expiresAt: Date.now() + 3600000});
      
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