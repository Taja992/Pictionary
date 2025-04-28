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
  DRAWER_WORD = 'drawer:word'
}

export interface BaseGameEvent {
  type: string;
  gameId: string;
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

//////////////// base game ///////////////////
export interface GameCreatedEvent extends BaseGameEvent {
  status: string;
  totalRounds: number;
  timePerRound: number;
}

export interface GameStartedEvent extends BaseGameEvent {
  currentRound: number;
}

export interface RoundStartedEvent extends BaseGameEvent {
  roundNumber: number;
  totalRounds: number;
  drawerId: string;
  startTime: string;
  durationSeconds: number;
}

export interface DrawerSelectedEvent {
  type: string;
  drawerId: string;
  drawerName: string;
}

export interface DrawerWordEvent {
  type: string;
  word: string;
}

export interface RoundEndedEvent extends BaseGameEvent {
  roundNumber: number;
  totalRounds: number;
  isLastRound: boolean;
}

export interface GameEndedEvent extends BaseGameEvent {
  status: string;
}