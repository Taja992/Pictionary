import { WsClientProvider } from 'ws-request-hook';
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { userAtom } from "./atoms";
import ApplicationRoutes from "./ApplicationRoutes";
import { Navigate, Route, Routes } from 'react-router-dom';
import { HomeRoute } from './routeConstants';
import { HomePage } from './pages';
import { api } from './api';
import toast from 'react-hot-toast';

function App() {
  const [serverUrl, setServerUrl] = useState<string | undefined>(undefined);
  const [user, setUser] = useAtom(userAtom);
  
  useEffect(() => {
    const validateUser = async () => {
      // Check local expiration first
      if (user.id && user.expiresAt && Date.now() > user.expiresAt) {
        console.log('User session expired locally');
        setUser({
          id: '',
          username: '',
          totalGamesPlayed: 0,
          totalGamesWon: 0
        });
        toast.error('Your session has expired. Please log in again.');
        return;
      }
  
      // If not expired locally, check with server
      if (user.id) {
        try {
          await api.api.userGetUser(user.id);
          console.log('User validated with server');
        } catch (error) {
          console.log('User validation failed - not found in database');
          setUser({
            id: '',
            username: '',
            totalGamesPlayed: 0,
            totalGamesWon: 0
          });
          toast.error('Your session has expired. Please log in again.');
        }
      }
    };
  
    validateUser();
  }, [user.id, user.expiresAt, setUser]);

  useEffect(() => {
    // Only establish WebSocket connection if user exists with valid ID
    if (user.id) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'localhost:5295';
      const isDev = import.meta.env.DEV;
      const protocol = isDev ? 'ws' : 'wss';
      
      // Use the actual database user ID from the API response
      const finalUrl = `${protocol}://${baseUrl}/ws?userId=${encodeURIComponent(user.id)}&username=${encodeURIComponent(user.username)}`;
      
      console.log("Connecting with registered user:", user.id, user.username);
      setServerUrl(finalUrl);
    }
  }, [user.id, user.username]);

  if (!user.id) {
    return (
      <Routes>
        <Route path={HomeRoute} element={<HomePage />} />
        <Route path="*" element={<Navigate to={HomeRoute} replace />} />
      </Routes>
    );
  }

  if (!serverUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">Connecting to server...</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <WsClientProvider url={serverUrl}>
      <ApplicationRoutes />
    </WsClientProvider>
  );
}

export default App;