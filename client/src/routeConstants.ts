// Route paths as constants
export const HomeRoute = '/';
export const LobbyRoute = '/lobby';
export const RoomDetailRoute = '/rooms/:roomId';
export const NotFoundRoute = '/404';

// Helper functions for creating URLs with parameters
export const createRoomUrl = (roomId: string) => `/rooms/${roomId}`;

