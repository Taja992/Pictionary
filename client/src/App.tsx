import { WsClientProvider } from 'ws-request-hook';
import { useEffect, useState } from "react";
import ApplicationRoutes from "./ApplicationRoutes";
import './App.css';

// Generate a unique ID for this client
export const randomUid = crypto.randomUUID();

function App() {
  const [serverUrl, setServerUrl] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    // Get the user from local storage
    const storedUserRaw = localStorage.getItem('pictionary_user');
    let storedUser = null;
    if (storedUserRaw) {
      try {
        storedUser = JSON.parse(storedUserRaw);
      } catch (e) {
        console.error('Failed to parse localStorage user', e);
      }
    }
    
    // Build the WebSocket URL with user params if available
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'localhost:5295';
    const isDev = import.meta.env.DEV;
    const protocol = isDev ? 'ws' : 'wss';
    
    let finalUrl = `${protocol}://${baseUrl}/ws?id=${randomUid}`;
    
    // Add user info to URL if available
    if (storedUser?.id) {
      finalUrl += `&userId=${encodeURIComponent(storedUser.id)}`;
      if (storedUser.username) {
        finalUrl += `&username=${encodeURIComponent(storedUser.username)}`;
      }
    }
    
    setServerUrl(finalUrl);
  }, []);
  
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