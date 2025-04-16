import { useState, useEffect } from 'react';

export default function WebSocketConnectionIndicator() {
  // Mock connection state - will later integrate with react-use-websocket
  const [isConnected, setIsConnected] = useState(false);

  // Simulate connection status for now
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success' : 'bg-error'}`}></div>
      <span className="text-sm">{isConnected ? 'Connected' : 'Connecting...'}</span>
    </div>
  );
}