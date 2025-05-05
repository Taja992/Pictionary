// Client instances
export { default as api } from './api';

// WebSocket handler components
export { default as LobbyWebSocketHandler } from './LobbyWebSocketHandler';
export { default as RoomWebSocketHandler } from './RoomWebSocketHandler';

// Types from api-client.ts
export type {
  GameDto,
  ScoreDto,
  CreateGameRequest,
  RoomDto,
  PlayerDto,
  CreateRoomRequest,
  JoinRoomRequest,
  UserDto,
  TempUserRequest
} from './api-client';

// WebSocket types
export {
  MessageType,
  RoomAction
} from './websocket-types';

export type {
  BaseMessage,
  ChatMessageDto,
  DrawEventDto,
  ClearCanvasDto,
  RoomJoinDto,
  RoomLeaveDto,
  RoomUpdateDto,
  GameCreatedEvent,
  GameStartedEvent,
  RoundStartedEvent,
  DrawerSelectedEvent,
  DrawerWordEvent,
  RoundEndedEvent,
  GameEndedEvent,
  JoinedGameEvent,
  RoomCreatedEvent,
  RoomDeletedEvent,
  ScoreUpdatedEvent
} from './websocket-types';

// Utility function to generate request IDs (used in multiple places)
export const generateRequestId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};