import { atom } from 'jotai';
import { RoomDto, UserDto, GameDto, PlayerDto } from './api';
import { atomWithStorage } from 'jotai/utils';


// All Rooms
export const roomsListAtom = atom<RoomDto[]>([]);

// Current Room
export const currentRoomAtom = atom<RoomDto | null>(null);

// Current Game
export const currentGameAtom = atom<GameDto | null>(null);

// This is just to be able to show what the word was to other users at the end of a round
export const endRoundWordAtom = atom<string | null>(null);

export const isDrawerAtom = atom((get) => {
  const user = get(userAtom);
  const currentGame = get(currentGameAtom);
  return currentGame?.currentDrawerId === user.id;
});

// Check room owner
export const isRoomOwnerAtom = atom((get) => {
  const user = get(userAtom);
  const room = get(currentRoomAtom);
  return user.id === room?.ownerId;
})

// Define a default/initial user state
const defaultUser: UserDto = {
  id: '',
  username: '',
  totalGamesPlayed: 0,
  totalGamesWon: 0
};

interface UserDtoExpiration extends UserDto {
  expiresAt?: number;
}

// Create the user atom with expiration time
export const userAtom = atomWithStorage<UserDtoExpiration>('pictionary_user', defaultUser);

// Made 2 difference interfaces because roomplayers
// wont necessarily have points, we make isonline required to avoid
// a bunch of null checks
export interface RoomPlayer extends PlayerDto {
  isOnline: boolean;
}

export interface GamePlayer extends PlayerDto {
  isOnline: boolean; // this is just for consistency
  totalPoints: number;
  lastPointsGained?: number; // this and next are for animation
  lastScoreTime?: Date;
}

// Separate for the 2 seperate lists
export const roomPlayersAtom = atom<RoomPlayer[]>([]);

export const gamePlayersAtom = atom<GamePlayer[]>([]);


export interface SystemMessage {
  id: string;
  text: string;
  timestamp: Date;
  type: 'join' | 'leave'
}

export const systemMessagesAtom = atom<SystemMessage[]>([]);

