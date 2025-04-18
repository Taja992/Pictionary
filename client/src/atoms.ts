import { atom } from 'jotai';

// --- User Authentication State ---
interface User {
  id: string;
  name: string;
  isAuthenticated: boolean;
}

const defaultUser: User = {
  id: '',
  name: localStorage.getItem('playerName') || '',
  isAuthenticated: false
};

export const userAtom = atom<User>(defaultUser);

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