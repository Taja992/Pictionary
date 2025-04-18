import { Api } from '../api/api-client';


// Initialize API client
const apiClient = new Api({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5295',
});

// Game service functions
export const createGame = async (roomId: string, rounds = 3, timePerRound = 80) => {
  try {
    const response = await apiClient.api.gameOrchestrationCreateGame({
      roomId,
      rounds,
      timePerRound
    });
    return response.data;
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

export const startGame = async (gameId: string) => {
  try {
    const response = await apiClient.api.gameOrchestrationStartGame(gameId);
    return response.data;
  } catch (error) {
    console.error('Error starting game:', error);
    throw error;
  }
};

export const startRound = async (gameId: string) => {
  try {
    const response = await apiClient.api.gameOrchestrationStartRound(gameId);
    return response.data;
  } catch (error) {
    console.error('Error starting round:', error);
    throw error;
  }
};

export const endRound = async (gameId: string) => {
  try {
    const response = await apiClient.api.gameOrchestrationEndRound(gameId);
    return response.data;
  } catch (error) {
    console.error('Error ending round:', error);
    throw error;
  }
};

export const endGame = async (gameId: string) => {
  try {
    const response = await apiClient.api.gameOrchestrationEndGame(gameId);
    return response.data;
  } catch (error) {
    console.error('Error ending game:', error);
    throw error;
  }
};

export const assignDrawer = async (gameId: string, userId: string) => {
  try {
    const response = await apiClient.api.gameOrchestrationAssignDrawer(gameId, { userId });
    return response.data;
  } catch (error) {
    console.error('Error assigning drawer:', error);
    throw error;
  }
};

export const selectWord = async (gameId: string, category?: string) => {
  try {
    const response = await apiClient.api.gameOrchestrationSelectWord(gameId, { category });
    return response.data;
  } catch (error) {
    console.error('Error selecting word:', error);
    throw error;
  }
};
