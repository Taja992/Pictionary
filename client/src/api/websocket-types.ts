// WebSocket message types
export enum MessageType {
  CHAT_MESSAGE = 'ChatMessage',
  JOIN_ROOM = 'JoinRoom',
  DRAW_EVENT = 'DrawEvent',
  CLEAR_CANVAS = 'ClearCanvas',
  ROOM_JOIN = 'RoomJoin',
  ROOM_LEAVE = 'RoomLeave',
  ROOM_UPDATE = 'RoomUpdate',
  GAME_CREATED = 'game:created',
  GAME_STARTED = 'game:started',
  ROUND_STARTED = 'round:started',
  ROUND_ENDED = 'round:ended',
  GAME_ENDED = 'game:ended',
  DRAWER_SELECTED = 'drawer:selected',
  DRAWER_WORD = 'drawer:word',
  ROOM_CREATED = 'room:created',
  ROOM_DELETED = 'room:deleted'
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
  IsInProgress: boolean;
}

// Clear canvas event interface
export interface ClearCanvasDto extends BaseMessage {
  eventType: MessageType.CLEAR_CANVAS;
  RoomId: string;
  Username: string;
}

export interface RoomJoinDto extends BaseMessage {
  eventType: MessageType.ROOM_JOIN;
  RoomId: string;
  UserId: string;
  Username: string;
}

export interface RoomLeaveDto extends BaseMessage {
  eventType: MessageType.ROOM_LEAVE;
  RoomId: string;
  UserId: string;
  Username: string;
}

export interface RoomUpdateDto extends BaseMessage {
  eventType: MessageType.ROOM_UPDATE;
  RoomId: string;
  UserId: string;
  Username: string;
  Action: RoomAction;
}

export enum RoomAction {
  Joined = 0,
  Left = 1
}

//////////////// game notifications ///////////////////
export interface GameCreatedEvent extends BaseMessage {
  eventType: MessageType.GAME_CREATED;
  GameId: string;
  Status: string;
  TotalRounds: number;
  TimePerRound: number;
}

export interface GameStartedEvent extends BaseMessage {
  eventType: MessageType.GAME_STARTED;
  GameId: string;
  CurrentRound: number;
}

export interface RoundStartedEvent extends BaseMessage {
  eventType: MessageType.ROUND_STARTED;
  GameId: string;
  RoundNumber: number;
  TotalRounds: number;
  DrawerId: string;
  StartTime: string;
  DurationSeconds: number;
}

export interface DrawerSelectedEvent extends BaseMessage {
  eventType: MessageType.DRAWER_SELECTED;
  DrawerId: string;
  DrawerName: string;
}

export interface DrawerWordEvent extends BaseMessage {
  eventType: MessageType.DRAWER_WORD;
  Word: string;
}

export interface RoundEndedEvent extends BaseMessage {
  eventType: MessageType.ROUND_ENDED;
  GameId: string;
  RoundNumber: number;
  TotalRounds: number;
  IsLastRound: boolean;
}

export interface GameEndedEvent extends BaseMessage {
  eventType: MessageType.GAME_ENDED;
  GameId: string;
  Status: string;
}

////////////////// Room Notifications //////////////////
export interface RoomCreatedEvent extends BaseMessage {
  eventType: MessageType.ROOM_CREATED;
  RoomId: string;
  RoomName: string;
  OwnerId: string;
  OwnerName: string;
  IsPrivate: boolean;
}

export interface RoomDeletedEvent extends BaseMessage {
  eventType: MessageType.ROOM_DELETED;
  RoomId: string;
}