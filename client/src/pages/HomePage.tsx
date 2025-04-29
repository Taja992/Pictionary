import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../atoms';
import CreateTempUser from '../components/Home/CreateTempUser';
import { ROUTES } from '../routes';
import React from 'react';

export default function HomePage() {
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);

  // Check if user is already registered with both id and username
  const isRegistered = !!user.id && !!user.username;
  
  // When registration is successful, navigate to the rooms page
  const handleRegistrationSuccess = () => {
    navigate(ROUTES.ROOMS);
  };
  
  // If already registered, navigate immediately
  React.useEffect(() => {
    if (isRegistered) {
      navigate(ROUTES.ROOMS);
    }
  }, [isRegistered, navigate]);
  
  return (
    <div className="home-container">
      <h1 className="text-3xl font-bold mb-6">Welcome to Pictionary!</h1>
      
      {isRegistered ? (
        <p>Redirecting to rooms...</p>
      ) : (
        <CreateTempUser onSuccess={handleRegistrationSuccess} />
      )}
    </div>
  );
}