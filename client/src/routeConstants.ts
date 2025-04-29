// Route paths as constants
export const HomeRoute = '/';
export const LobbyRoute = '/lobby';
export const RoomDetailRoute = '/rooms/:roomId';

// Helper functions for creating URLs with parameters
export const createRoomUrl = (roomId: string) => `/rooms/${roomId}`;

