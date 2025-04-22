import { atom } from 'jotai';
import { RoomDto, UserDto, GameDto, PlayerDto } from './api/api-client';


// All Rooms
export const roomsListAtom = atom<RoomDto[]>([]);

// Current Room
export const currentRoomAtom = atom<RoomDto | null>(null);

// Current Game
export const currentGameAtom = atom<GameDto | null>(null);


// Check room owner
export const isRoomOwnerAtom = atom((get) => {
  const user = get(userAtom);
  const room = get(currentRoomAtom);
  return user.id === room?.ownerId;
})

// Define a default/initial user state
const defaultUser: UserDto = {
  id: undefined,
  username: undefined,
  totalGamesPlayed: 0,
  totalGamesWon: 0
};

// Create the user atom
export const userAtom = atom<UserDto>(defaultUser);


// Players List
export const playersAtom = atom<PlayerDto[]>([]);

// Current drawer
export const currentDrawerAtom = atom<PlayerDto | null>(null);

// --- Chat Messages ---
interface Message {
  id: string;
  sender: string;
  text: string;
  isSystem: boolean;
  timestamp: Date;
}

export const messagesAtom = atom<Message[]>([]);

// WebSocket connection status
export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export const webSocketStatusAtom = atom<WebSocketStatus>('disconnected');