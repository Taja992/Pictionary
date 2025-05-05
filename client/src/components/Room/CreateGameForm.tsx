import { useState } from 'react';
import { useAtom } from 'jotai';
import { currentRoomAtom, currentGameAtom } from '../../atoms';
import { api, CreateGameRequest } from '../../api';
import toast from 'react-hot-toast';

interface CreateGameFormProps {
  onGameCreated?: (gameId: string) => void; // Make it optional
}

export default function CreateGameForm({ onGameCreated }: CreateGameFormProps) {
  const [currentRoom] = useAtom(currentRoomAtom);
  const [, setCurrentGame] = useAtom(currentGameAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateGameRequest>>({
    rounds: 3,
    timePerRound: 60,
    roomId: currentRoom?.id
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value, 10)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    
    if (!currentRoom?.id) {
      console.error('Room ID is missing:', currentRoom);
      toast.error('Room ID is missing. Please refresh the page.');
      return;
    }
    
    // Ensure roomId is set
    const gameRequest: CreateGameRequest = {
      ...formData,
      roomId: currentRoom.id
    };
    
    console.log('Game request payload:', gameRequest);
    
    try {
      setIsLoading(true);
      console.log('Calling API to create game...');
      
      // Call the API to create a new game
      const response = await api.api.gameOrchestrationCreateGame(gameRequest);
      console.log('API response:', response);
      
      // Store the new game in state
      setCurrentGame(response.data);
      
      // Notify parent component about successful game creation
      if (onGameCreated) {
        onGameCreated(response.data.id || '');
      }
      
      toast.success('Game created successfully!');
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-game-form">
      <h2>Create a New Game</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="rounds">Number of Rounds</label>
          <input
            type="number"
            id="rounds"
            name="rounds"
            min="1"
            max="5"
            value={formData.rounds}
            onChange={handleChange}
            required
          />
          <span className="form-hint">Maximum 5 rounds</span>
        </div>
        
        <div className="form-group">
          <label htmlFor="timePerRound">Time per Round (seconds)</label>
          <input
            type="number"
            id="timePerRound"
            name="timePerRound"
            min="45"
            max="180" 
            step="5"
            value={formData.timePerRound}
            onChange={handleChange}
            required
          />
          <span className="form-hint">Between 45-180 seconds</span>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Start Game'}
        </button>
      </form>
    </div>
  );
}