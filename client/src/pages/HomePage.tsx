import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../atoms';
import CreateTempUser from '../components/Home/CreateTempUser';
import { useEffect } from 'react';
import { LobbyRoute } from '../routeConstants';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);

  // Check if user is already registered with both id and username
  const isRegistered = !!user.id && !!user.username;
  
  // When registration is successful, navigate to the rooms page
  const handleRegistrationSuccess = () => {
    navigate(LobbyRoute);
  };
  
  // If already registered, navigate immediately
  useEffect(() => {
    if (isRegistered) {
      navigate(LobbyRoute);
    }
  }, [isRegistered, navigate]);
  
  return (
    <div className="homepage">
      <div className="homepage-background">
        <div className="homepage-decoration pencil"></div>
        <div className="homepage-decoration brush"></div>
        <div className="homepage-decoration eraser"></div>
        <div className="homepage-decoration palette"></div>
      </div>
      
      <div className="homepage-container">
        <div className="logo-container">
          <h1 className="game-title">DrawIt!</h1>
          <div className="game-tagline">
          <p>Draw, Guess, Win!</p>
          <p>In this totally original game!</p>
          </div>
        </div>
        
        <div className="card login-card">
          {isRegistered ? (
            <div className="login-loading">
              <p>Redirecting to rooms...</p>
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <>
              <h2>Join the Fun!</h2>
              <p className="login-subtitle">Choose a nickname to get started</p>
              <CreateTempUser onSuccess={handleRegistrationSuccess} />
            </>
          )}
        </div>
        
        <div className="game-features">
          <div className="feature">
            <div className="feature-icon draw-icon"></div>
            <h3>Draw</h3>
            <p>Show off your artistic skills</p>
          </div>
          <div className="feature">
            <div className="feature-icon guess-icon"></div>
            <h3>Guess</h3>
            <p>Solve puzzles quickly</p>
          </div>
          <div className="feature">
            <div className="feature-icon win-icon"></div>
            <h3>Win</h3>
            <p>Compete for the highest score</p>
          </div>
        </div>
      </div>
    </div>
  );
}