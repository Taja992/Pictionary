import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { ROUTES } from '../routes';
import { userAtom } from '../atoms';
import { CreateTempUser } from '../components/Home';
import '../components/home/home.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);

  // Check if user is already registered
  const isRegistered = !!user.id;
  
  // When registration is successful, navigate to the rooms page
  const handleRegistrationSuccess = () => {
    navigate(ROUTES.ROOMS);
  };
  
  return (
    <>
      {isRegistered ? (
        <div className="welcome-back">
          <h2>Welcome back, {user.username}!</h2>
          <button 
            className="btn btn-primary mt-4" 
            onClick={() => navigate(ROUTES.ROOMS)}
          >
            Find a Game
          </button>
        </div>
      ) : (
        <CreateTempUser onSuccess={handleRegistrationSuccess} />
      )}
    </>
  );
}