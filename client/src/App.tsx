import { WsClientProvider } from 'ws-request-hook';
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { userAtom } from "./atoms";
import ApplicationRoutes from "./ApplicationRoutes";
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { HomeRoute } from './routeConstants';
import { HomePage } from './pages';

function App() {
  const [serverUrl, setServerUrl] = useState<string | undefined>(undefined);
  const [user] = useAtom(userAtom);
  
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
    return <div>Loading...</div>;
  }
  
  return (
    <WsClientProvider url={serverUrl}>
      <ApplicationRoutes />
    </WsClientProvider>
  );
}

export default App;