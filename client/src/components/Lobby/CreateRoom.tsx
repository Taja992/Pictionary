import { useState } from 'react';
import { CreateRoomRequest } from '../../api';

interface CreateRoomProps {
  isOpen: boolean;
  isLoading: boolean;
  username: string;
  onClose: () => void;
  onSubmit: (request: CreateRoomRequest) => void;
}

export default function CreateRoom({ 
  isOpen, 
  isLoading, 
  username,
  onClose, 
  onSubmit 
}: CreateRoomProps) {
  const [formData, setFormData] = useState<CreateRoomRequest>({
    name: '',
    username: username,
    isPrivate: false,
    password: null
  });
  
  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name?.trim()) return;
    
    // If not private, ensure password is null
    const request: CreateRoomRequest = {
      ...formData,
      password: formData.isPrivate ? formData.password : null
    };
    
    onSubmit(request);
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create a New Game Room</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Room Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Enter room name"
              required
            />
          </div>
          
          <div className="form-group form-check">
            <input
              id="isPrivate"
              name="isPrivate"
              type="checkbox"
              checked={formData.isPrivate || false}
              onChange={handleChange}
              className="form-check-input"
            />
            <label htmlFor="isPrivate" className="form-check-label">
              Private Room
            </label>
          </div>
          
          {formData.isPrivate && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password || ''}
                onChange={handleChange}
                placeholder="Enter room password"
                required={formData.isPrivate}
              />
            </div>
          )}
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading || !formData.name?.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}