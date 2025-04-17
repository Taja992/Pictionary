import React, { useState } from 'react';

interface NameFormProps {
  onSubmit: (name: string) => void;
}

export default function NameForm({ onSubmit }: NameFormProps) {
  const [playerName, setPlayerName] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onSubmit(playerName);
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
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="input input-bordered name-input" 
          placeholder="Enter your name"
          maxLength={20}
          required
        />
      </div>
      
      <div className="button-group">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={!playerName.trim()}
        >
          Play!
        </button>
        <button type="button" className="btn btn-outline">How to Play</button>
      </div>
    </form>
  );
}