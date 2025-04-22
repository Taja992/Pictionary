import { atom } from 'jotai';
import { RoomDto, UserDto } from './api/api-client';






// All Rooms
export const roomsListAtom = atom<RoomDto[]>([]);

// Current Room
export const currentRoomAtom = atom<RoomDto | null>(null);


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









// --- Game Settings ---
interface GameSettings {
  rounds: number;
  timePerRound: number;
  categories: string[];
}

export const gameSettingsAtom = atom<GameSettings>({
  rounds: 3,
  timePerRound: 60,
  categories: ['Animals', 'Food', 'Sports', 'Movies', 'Mixed']
});

// --- Current Game State ---
interface CurrentGame {
  roomId: string | null;
  gameId: string | null;
  status: 'waiting' | 'playing' | 'finished' | null;
  currentRound: number;
  totalRounds: number;
  timeLeft: number;
  currentWord: string | null;
  isDrawer: boolean;
}

export const currentGameAtom = atom<CurrentGame>({
  roomId: null,
  gameId: null,
  status: null,
  currentRound: 0,
  totalRounds: 0,
  timeLeft: 0,
  currentWord: null,
  isDrawer: false
});

// --- Navigation State ---
interface NavigationState {
  previousRoute: string | null;
  currentRoute: string;
}

export const navigationStateAtom = atom<NavigationState>({
  previousRoute: null,
  currentRoute: '/'
});

// --- Players List ---
interface Player {
  id: string;
  name: string;
  score: number;
  isDrawing: boolean;
}

export const playersAtom = atom<Player[]>([]);

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