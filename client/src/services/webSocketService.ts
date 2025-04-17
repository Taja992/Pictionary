// WebSocket message types
export enum MessageType {
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  DRAW_LINE = 'DRAW_LINE',
  CLEAR_CANVAS = 'CLEAR_CANVAS',
  GAME_UPDATE = 'GAME_UPDATE',
  PLAYER_JOINED = 'PLAYER_JOINED',
  PLAYER_LEFT = 'PLAYER_LEFT',
  ROUND_START = 'ROUND_START',
  ROUND_END = 'ROUND_END',
  CORRECT_GUESS = 'CORRECT_GUESS',
  GAME_OVER = 'GAME_OVER',
}

export interface LineProps {
  points: number[];
  stroke: string;
  strokeWidth: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isSystem: boolean;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isDrawing: boolean;
}

// Initialize WebSocket connection
export const initializeWebSocket = (roomId: string): WebSocket => {
  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5295/ws';
  const playerName = localStorage.getItem('playerName') || 'Anonymous';
  
  const ws = new WebSocket(`${WS_URL}?roomId=${roomId}&playerName=${playerName}`);
  return ws;
};

// Send a chat message over WebSocket
export const sendChatMessage = (ws: WebSocket | null, message: string, sender: string): boolean => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return false;
  
  try {
    const chatMessage = {
      type: MessageType.CHAT_MESSAGE,
      payload: {
        sender,
        text: message,
        timestamp: new Date().toISOString(),
      }
    };
    
    ws.send(JSON.stringify(chatMessage));
    return true;
  } catch (e) {
    console.error("Error sending chat message:", e);
    return false;
  }
};

// Send drawing data over WebSocket
export const sendDrawingData = (ws: WebSocket | null, line: LineProps): boolean => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return false;
  
  try {
    const drawMessage = {
      type: MessageType.DRAW_LINE,
      payload: line
    };
    
    ws.send(JSON.stringify(drawMessage));
    return true;
  } catch (e) {
    console.error("Error sending drawing data:", e);
    return false;
  }
};

// Send canvas clear command over WebSocket
export const sendClearCanvas = (ws: WebSocket | null): boolean => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return false;
  
  try {
    const clearMessage = {
      type: MessageType.CLEAR_CANVAS,
      payload: {}
    };
    
    ws.send(JSON.stringify(clearMessage));
    return true;
  } catch (e) {
    console.error("Error sending clear canvas command:", e);
    return false;
  }
};

// Parse WebSocket message
export const parseWebSocketMessage = (message: MessageEvent): {type: MessageType, payload: any} => {
  try {
    return JSON.parse(message.data);
  } catch (error) {
    console.error('Error parsing WebSocket message:', error);
    return {
      type: MessageType.CHAT_MESSAGE,
      payload: {
        sender: 'System',
        text: 'Error parsing message',
        isSystem: true
      }
    };
  }
};