import { atom } from 'jotai';
import { RoomDto, UserDto, GameDto, PlayerDto } from './api';
import { atomWithStorage } from 'jotai/utils';


// All Rooms
export const roomsListAtom = atom<RoomDto[]>([]);

// Current Room
export const currentRoomAtom = atom<RoomDto | null>(null);

// Current Game
export const currentGameAtom = atom<GameDto | null>(null);
export const isDrawerAtom = atom<boolean>(false);


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

// Create the user atom
export const userAtom = atomWithStorage<UserDto>('pictionary_user', defaultUser);


// Players List
export const roomPlayersAtom = atom<PlayerDto[]>([]);


// export interface PlayerDto {
//   id?: string;
//   name?: string;
//   isOnline?: boolean;
// }
export interface ScoreDto extends PlayerDto {
  totalPoints?: number;      
  lastPointsGained?: number; 
  lastScoreTime?: Date;      
}

export const gamePlayersAtom = atom<ScoreDto[]>([]);

// Current drawer
export const currentDrawerAtom = atom<PlayerDto | null>(null);



export interface SystemMessage {
  id: string;
  text: string;
  timestamp: Date;
  type: 'join' | 'leave'
}

export const systemMessagesAtom = atom<SystemMessage[]>([]);

