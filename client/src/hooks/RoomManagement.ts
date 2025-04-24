// import { useEffect } from 'react';
// import { useAtom } from 'jotai';
// import { userAtom, currentRoomAtom } from '../atoms';
// import api from '../api/api';

// export function useRoomManagement() {
//   const [user] = useAtom(userAtom);
//   const [currentRoom, setCurrentRoom] = useAtom(currentRoomAtom);

//   // Setup leave room function
//   const leaveRoom = async () => {
//     if (currentRoom?.id && user?.id) {
//       try {
//         console.log(`User ${user.username} leaving room ${currentRoom.name}`);
//         await api.api.roomLeaveRoom(currentRoom.id, { userId: user.id });
//         setCurrentRoom(null);
//         return true;
//       } catch (err) {
//         console.error('Error leaving room:', err);
//         return false;
//       }
//     }
//     return true; // No room to leave
//   };

//   // Only handle beforeunload event, not component unmount
//   useEffect(() => {
//     // Register beforeunload event to handle page refreshes/closes
//     const handleBeforeUnload = () => {
//       if (currentRoom?.id && user?.id) {
//         // Synchronous API call for beforeunload
//         navigator.sendBeacon(
//           `/api/Room/${currentRoom.id}/leave?userId=${user.id}`
//         );
//       }
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);

//     // Cleanup function only removes event listener
//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       // REMOVE this line - it's causing problems
//       // leaveRoom();
//     };
//   }, [currentRoom?.id, user?.id]);

//   return { leaveRoom };
// }