

// Define route paths as constants for type safety and reusability
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ROOMS: '/rooms',
  ROOM_DETAIL: '/rooms/:roomId',
  GAME: '/games/:gameId',
  PROFILE: '/profile',
};

// Types for route parameters
export interface RoomParams {
  roomId: string;
}

export interface GameParams {
  gameId: string;
}
