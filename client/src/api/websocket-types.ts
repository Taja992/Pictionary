// WebSocket message types
export enum MessageType {
  CHAT_MESSAGE = 'ChatMessage',
  JOIN_ROOM = 'JoinRoom',
  DRAW_EVENT = 'DrawEvent',
  CLEAR_CANVAS = 'ClearCanvas'
}

// Base interface for all messages
export interface BaseMessage {
  eventType: MessageType;
  requestId: string;
}

// Chat message interface
export interface ChatMessageDto extends BaseMessage {
  eventType: MessageType.CHAT_MESSAGE;
  Message: string;
  Username: string;
  RoomId: string;
  Timestamp: string;
}

// Join room message interface
export interface JoinRoomDto extends BaseMessage {
  eventType: MessageType.JOIN_ROOM;
  RoomId: string;
  Username: string;
}

// Drawing event interface
export interface DrawEventDto extends BaseMessage {
  eventType: MessageType.DRAW_EVENT;
  RoomId: string;
  Username: string;
  LineData: {
    points: number[];
    stroke: string;
    strokeWidth: number;
  };
}

// Clear canvas event interface
export interface ClearCanvasDto extends BaseMessage {
  eventType: MessageType.CLEAR_CANVAS;
  RoomId: string;
  Username: string;
}