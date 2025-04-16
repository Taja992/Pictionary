import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import './HomePage.css';

export default function HomePage() {
  const [playerName, setPlayerName] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      // In a real app, you'd save the name to state/localStorage
      localStorage.setItem('playerName', playerName);
      navigate(ROUTES.ROOMS);
    }
  };
  
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Pictionary Online</h1>
        <p className="home-description">
          Draw, guess, and have fun with friends in this multiplayer drawing and guessing game!
        </p>
        
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
      </div>
    </div>
  );
}