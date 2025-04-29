// import { 
//   MessageType, 
//   ChatMessageDto, 
//   DrawEventDto, 
//   ClearCanvasDto,
//   RoomJoinDto,
//   RoomLeaveDto
// } from './websocket-types';import { webSocketStatusAtom } from '../atoms';
// import { getDefaultStore } from 'jotai';

// const jotaiStore = getDefaultStore();

// export class WebSocketClient {
//   private isJoiningRoom: Record<string, boolean> = {};
//   private socket: WebSocket | null = null;
//   private isConnected = false;
//   private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
//   private connectionHandlers: (() => void)[] = [];
//   private errorHandlers: ((error: Event) => void)[] = [];
//   private closeHandlers: ((event: CloseEvent) => void)[] = [];

//   constructor(private url: string = 'ws://localhost:5295/ws') {
//     // Initialize connection status
//     jotaiStore.set(webSocketStatusAtom, 'disconnected');
//   }

//   public get connected(): boolean {
//     return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
//   }

//   public connect(userId?: string, username?: string): Promise<void> {
//     return new Promise((resolve, reject) => {
//       try {
//         // If already connected, resolve immediately
//         if (this.connected) {
//           resolve();
//           return;
//         }

//         // Get user from localStorage to ensure consistency
//         const storedUserRaw = localStorage.getItem('pictionary_user');
//         let storedUser = null;
//         if (storedUserRaw) {
//           try {
//             storedUser = JSON.parse(storedUserRaw);
//           } catch (e) {
//             console.error('Failed to parse localStorage user', e);
//           }
//         }
       
//         // Use the most reliable user ID source
//         const userIdToUse = storedUser?.id || userId;
//         const usernameToUse = storedUser?.username || username;
       
//         if (!userIdToUse || !usernameToUse) {
//           console.error('Missing user ID or username for WebSocket connection');
//           reject(new Error('Missing user ID or username'));
//           return;
//         }
       
//         console.log('WebSocket connecting with user:', {
//           id: userIdToUse,
//           username: usernameToUse
//         });

//         // Update status to connecting
//         jotaiStore.set(webSocketStatusAtom, 'connecting');

//         let connectionUrl = this.url;
//         connectionUrl += `?userId=${encodeURIComponent(userIdToUse)}&username=${encodeURIComponent(usernameToUse)}`;
       
//         this.socket = new WebSocket(connectionUrl);

//         this.socket.onopen = () => {
//           console.log('WebSocket connected');
//           this.isConnected = true;
//           // Update status to connected
//           jotaiStore.set(webSocketStatusAtom, 'connected');
//           this.connectionHandlers.forEach(handler => handler());
//           resolve();
//         };

//         this.socket.onmessage = (event) => {
//           try {
//             const data = JSON.parse(event.data);
//             // All messages now use eventType
//             if (data.eventType) {
//               const handlers = this.messageHandlers.get(data.eventType) || [];
//               handlers.forEach(handler => handler(data));
//             } else {
//               console.warn('Received message without eventType:', data);
//             }
//           } catch (err) {
//             console.error('Error parsing WebSocket message:', err);
//           }
//         };

//         this.socket.onerror = (error) => {
//           console.error('WebSocket error:', error);
//           // Update status to error
//           jotaiStore.set(webSocketStatusAtom, 'error');
//           this.errorHandlers.forEach(handler => handler(error));
//           reject(error);
//         };

//         this.socket.onclose = (event) => {
//           console.log('WebSocket connection closed');
//           this.isConnected = false;
//           // Update status to disconnected
//           jotaiStore.set(webSocketStatusAtom, 'disconnected');
//           this.closeHandlers.forEach(handler => handler(event));
//           reject(new Error('WebSocket connection closed'));
//         };
//       } catch (error) {
//         // Update status to error
//         jotaiStore.set(webSocketStatusAtom, 'error');
//         reject(error);
//       }
//     });
//   }

//   public disconnect() {
//     if (this.socket) {
//       this.socket.close();
//       this.socket = null;
//       this.isConnected = false;
//       // Update status to disconnected
//       jotaiStore.set(webSocketStatusAtom, 'disconnected');
//     }
//   }

//   public roomJoin(roomId: string, userId: string, username: string): void {
//     const storedUser = JSON.parse(localStorage.getItem('pictionary_user') || '{}');

//     const userIdToUse = (storedUser && storedUser.id) || userId;
//     const usernameToUse = (storedUser && storedUser.username) || username;

//     console.log('Joining room with user:', {
//       id: userIdToUse,
//       username: usernameToUse,
//       room: roomId
//     });
   
//     // Add check to prevent duplicate join
//     const joinKey = `${roomId}:${userId}`;
//     if (this.isJoiningRoom[joinKey]) {
//       return;
//     }
   
//     if (!this.connected) {
//       console.error('WebSocket not connected');
//       return;
//     }

//     // Mark as joining
//     this.isJoiningRoom[joinKey] = true;
   
//     const joinRoomMessage: RoomJoinDto = {
//       eventType: MessageType.ROOM_JOIN,
//       requestId: this.generateRequestId(),
//       RoomId: roomId,
//       UserId: userId,
//       Username: username
//     };

//     this.socket!.send(JSON.stringify(joinRoomMessage));
   
//     // Clear the flag after a short timeout
//     setTimeout(() => {
//       this.isJoiningRoom[joinKey] = false;
//     }, 2000);
//   }

//   public roomLeave(roomId: string, userId: string, username: string): void {
//     if (!this.connected) {
//       console.error('WebSocket not connected');
//       return;
//     }

//     const leaveRoomMessage: RoomLeaveDto = {
//       eventType: MessageType.ROOM_LEAVE,
//       requestId: this.generateRequestId(),
//       RoomId: roomId,
//       UserId: userId,
//       Username: username
//     };

//     this.socket!.send(JSON.stringify(leaveRoomMessage));
//   }
   
 

//   public sendChatMessage(message: string, username: string, roomId: string): void {
//     if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
//       console.error('WebSocket not connected');
//       return;
//     }
   
//     const chatMessage: ChatMessageDto = {
//       eventType: MessageType.CHAT_MESSAGE,
//       requestId: this.generateRequestId(),
//       Message: message,
//       Username: username,
//       RoomId: roomId,
//       Timestamp: new Date().toISOString()
//     };
   
//     this.socket.send(JSON.stringify(chatMessage));
//   }

//   private generateRequestId(): string {
//     return Math.random().toString(36).substring(2, 15);
//   }

//   public on(eventType: MessageType, handler: (data: any) => void): void {
//     if (!this.messageHandlers.has(eventType)) {
//       this.messageHandlers.set(eventType, []);
//     }
   
//     this.messageHandlers.get(eventType)?.push(handler);
//   }

//   public off(eventType: MessageType, handler: (data: any) => void): void {
//     if (!this.messageHandlers.has(eventType)) {
//       return;
//     }
   
//     const handlers = this.messageHandlers.get(eventType) || [];
//     const index = handlers.indexOf(handler);
   
//     if (index !== -1) {
//       handlers.splice(index, 1);
//     }
//   }

//   public onOpen(handler: () => void): void {
//     this.connectionHandlers.push(handler);
//   }

//   public onError(handler: (error: Event) => void): void {
//     this.errorHandlers.push(handler);
//   }

//   public onClose(handler: (event: CloseEvent) => void): void {
//     this.closeHandlers.push(handler);
//   }

//     public sendDrawEvent(lineData: {points: number[], stroke: string, strokeWidth: number}, username: string, roomId: string): void {
//       if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
//         console.error('WebSocket not connected');
//         return;
//       }
     
//       const drawEvent: DrawEventDto = {
//         eventType: MessageType.DRAW_EVENT,
//         requestId: this.generateRequestId(),
//         RoomId: roomId,
//         Username: username,
//         LineData: lineData,
//         IsInProgress: false
//       };
     
//       this.socket.send(JSON.stringify(drawEvent));
//     }

//     public sendClearCanvas(username: string, roomId: string): void {
//       if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
//         console.error('WebSocket not connected');
//         return;
//       }

//       const clearEvent: ClearCanvasDto = {
//         eventType: MessageType.CLEAR_CANVAS,
//         requestId: this.generateRequestId(),
//         RoomId: roomId,
//         Username: username
//       };

//       this.socket.send(JSON.stringify(clearEvent));
//     }
// }

// // Create and export a singleton instance
// export const websocketClient = new WebSocketClient();