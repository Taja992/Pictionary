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

interface GamePlayerDto extends PlayerDto {
  totalPoints?: number;
  lastPointsGained?: number;
  lastScoreTime?: Date;
}

export const gamePlayersAtom = atom<GamePlayerDto[]>([]);
// Players List
export const roomPlayersAtom = atom<PlayerDto[]>([]);


export interface SystemMessage {
  id: string;
  text: string;
  timestamp: Date;
  type: 'join' | 'leave'
}

export const systemMessagesAtom = atom<SystemMessage[]>([]);

