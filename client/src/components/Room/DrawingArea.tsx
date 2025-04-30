import { useState } from 'react';
import { useAtom } from 'jotai';
import { currentGameAtom, isDrawerAtom, isRoomOwnerAtom } from '../../atoms';
import DrawingCanvas from './DrawingCanvas';
import CreateGameForm from './CreateGameForm';
import './game.css';

interface DrawingAreaProps {
  roomId: string;
}

export default function DrawingArea({ roomId }: DrawingAreaProps) {
  const [currentGame] = useAtom(currentGameAtom);
  const [isDrawer] = useAtom(isDrawerAtom);
  const [isRoomOwner] = useAtom(isRoomOwnerAtom);
  const [showCreateGame, setShowCreateGame] = useState(isRoomOwner && !currentGame);
  
  // No game exists yet
  if (!currentGame) {
    if (isRoomOwner) {
      return (
        <div className="drawing-area waiting-container">
          {showCreateGame ? (
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
          )}
        </div>
      );
    } else {
      return (
        <div className="drawing-area waiting-container">
          <h2>Waiting for the game to start</h2>
          <p className="waiting-message">The room owner will create a game shortly.</p>
        </div>
      );
    }
  }
  
  // Game exists - show appropriate UI based on game status
  switch (currentGame.status) {
    case 'Starting':
      return (
        <div className="drawing-area waiting-container">
          <h2>Game is about to start!</h2>
          <p className="waiting-message">Get ready to play Pictionary.</p>
        </div>
      );
    
    case 'Drawing':
      return (
        <div className="drawing-area">
          <DrawingCanvas isDrawer={isDrawer} roomId={roomId} />
          {isDrawer && (
            <div className="drawer-indicator">
              You are drawing: <strong>{currentGame.currentWord}</strong>
            </div>
          )}
        </div>
      );
    
    case 'RoundEnd':
      return (
        <div className="drawing-area waiting-container">
          <h2>Round {currentGame.currentRound} ended!</h2>
          <p className="waiting-message">Preparing for next round...</p>
        </div>
      );
    
    case 'GameEnd':
      return (
        <div className="drawing-area waiting-container">
          <h2>Game Over!</h2>
          <p className="waiting-message">Thanks for playing!</p>
          {isRoomOwner && (
            <button 
              className="create-new-game-btn"
              onClick={() => setShowCreateGame(true)}
            >
              Create New Game
            </button>
          )}
        </div>
      );
    
    default:
      return (
        <div className="drawing-area waiting-container">
          <h2>Waiting for the game to start</h2>
          <p className="waiting-message">The game will begin soon.</p>
        </div>
      );
  }
}