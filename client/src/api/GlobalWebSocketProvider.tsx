// import React, { useEffect } from 'react';
// import { useAtom } from 'jotai';
// import { websocketClient } from './websocket-client';
// import { userAtom, webSocketStatusAtom } from '../atoms';
//
// interface GlobalWebSocketProviderProps {
//   children: React.ReactNode;
// }
//
// export default function GlobalWebSocketProvider({ children }: GlobalWebSocketProviderProps) {
//   const [user] = useAtom(userAtom);
//   const [wsStatus, setWsStatus] = useAtom(webSocketStatusAtom);
//  
//   // Handle global WebSocket connection
//   useEffect(() => {
//     if (!user.username || !user.id) return;
//    
//     const connectGlobalSocket = async () => {
//       try {
//         // Only connect if not already connected
//         if (wsStatus === 'disconnected' || wsStatus === 'error') {
//           console.log('Establishing global WebSocket connection for user:', user.id);
//           await websocketClient.connect(user.id, user.username);
//           setWsStatus('connected');
//         }
//       } catch (err) {
//         console.error('Failed to establish global WebSocket connection:', err);
//         setWsStatus('error');
//       }
//     };
//
//     connectGlobalSocket();
//    
//     // Clean up on unmount or user change
//     return () => {
//       if (websocketClient.connected) {
//         console.log('Disconnecting global WebSocket connection');
//         websocketClient.disconnect();
//         setWsStatus('disconnected');
//       }
//     };
//   }, [user.id, user.username, wsStatus, setWsStatus]);
//
//   return <>{children}</>;
// }