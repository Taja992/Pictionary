import { useState } from 'react';
import { useAtom } from 'jotai';
import { currentGameAtom, isDrawerAtom, isRoomOwnerAtom, endRoundWordAtom } from '../../atoms';
import DrawingCanvas from './DrawingCanvas';
import CreateGameForm from './CreateGameForm';
import './DrawingArea.css';

interface DrawingAreaProps {
  roomId: string;
}

export default function DrawingArea({ roomId }: DrawingAreaProps) {
  const [currentGame] = useAtom(currentGameAtom);
  const [isDrawer] = useAtom(isDrawerAtom);
  const [isRoomOwner] = useAtom(isRoomOwnerAtom);
  const [showCreateGame, setShowCreateGame] = useState(isRoomOwner && !currentGame);
  const [lastRoundWord] = useAtom(endRoundWordAtom);

  // Helper function to render the game creation UI
  const renderGameCreationUI = () => {
    if (!isRoomOwner) return null;
    
    return showCreateGame ? (
      <CreateGameForm 
        onGameCreated={(gameId) => {
          console.log(`Game ${gameId} was created`);
          setShowCreateGame(false);
        }}
      />
    ) : (
      <button 
        className="btn btn-primary"
        onClick={() => setShowCreateGame(true)}
      >
        Create Game
      </button>
    );
  };

  // Helper function to render waiting container
  const renderWaitingContainer = (title: string, message?: string, showGameCreation = false) => (
    <div className="drawing-area waiting-container">
      <h2>{title}</h2>
      {message && <p className="waiting-message">{message}</p>}
      {showGameCreation && renderGameCreationUI()}
    </div>
  );

  // Handle no game state
  if (!currentGame) {
    if (isRoomOwner) {
      return (
        <div className="drawing-area waiting-container">
          {renderGameCreationUI()}
        </div>
      );
    }
    return renderWaitingContainer(
      "Waiting for the game to start", 
      "The room owner will create a game shortly."
    );
  }
  
  // Handle game states
  switch (currentGame.status) {
    case 'Starting':
      return renderWaitingContainer(
        "Game is about to start!", 
        "Get ready to play Pictionary."
      );
    
    case 'Drawing':
      return (
        <div className="drawing-area">
          <DrawingCanvas isDrawer={isDrawer} roomId={roomId} />
        </div>
      );
    
    case 'RoundEnd':
      console.log('RoundEnd - currentGame:', currentGame);
      return renderWaitingContainer(
        `Round ${currentGame.currentRound} ended!`,
        `The word was: ${lastRoundWord || 'Unknown'}. Preparing for next round...`
      );
    
    case 'GameEnd':
      return (
        <div className="drawing-area waiting-container">
          <h2>Game Over! The last word was <strong>{lastRoundWord || 'Unknown'}</strong></h2>
          <p className="waiting-message">Thanks for playing!</p>
          {renderGameCreationUI()}
        </div>
      );
    
    default:
      return renderWaitingContainer(
        "Waiting for the game to start", 
        "The game will begin soon."
      );
  }
}