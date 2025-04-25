import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { currentGameAtom, currentRoomAtom, userAtom, isDrawerAtom } from '../../atoms';
import ChatArea from './ChatArea';
import DrawingCanvas from './DrawingCanvas';
import CreateGameForm from './CreateGameForm';
import './game.css';

interface GameContainerProps {
  roomId: string;
}

export default function GameContainer({ roomId }: GameContainerProps) {
  const [currentGame] = useAtom(currentGameAtom);
  const [currentRoom] = useAtom(currentRoomAtom);
  const [user] = useAtom(userAtom);
  const [isDrawer] = useAtom(isDrawerAtom);
  
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [roundWord, setRoundWord] = useState<string>('');
  
  // Determine if the current user is the room owner
  const isRoomOwner = currentRoom?.ownerId === user.id;
  
  // Calculate time left for the current round
  useEffect(() => {
    if (!currentGame || !currentGame.roundStartTime || currentGame.status !== 'Drawing') {
      setTimeLeft(0);
      return;
    }
    
    // Get the time when the round started
    const roundStartTime = new Date(currentGame.roundStartTime).getTime();
    const roundDuration = (currentGame.roundTimeSeconds || 60) * 1000;
    const endTime = roundStartTime + roundDuration;
    
    // Set up timer
    const timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(timerInterval);
      }
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [currentGame?.roundStartTime, currentGame?.roundTimeSeconds, currentGame?.status]);
  
  // Set the current word based on game state
  useEffect(() => {
    if (currentGame?.currentWord && isDrawer) {
      // If user is drawer, show the actual word
      setRoundWord(currentGame.currentWord);
    } else if (currentGame?.status === 'Drawing') {
      // For guessers during active round, show blanks
      if (currentGame.currentWord) {
        // This shouldn't happen, but if it does, show blanks with same length
        setRoundWord('_ '.repeat(currentGame.currentWord.length).trim());
      } else {
        // If word is not available, show generic blanks
        setRoundWord('_ _ _ _ _');
      }
    } else {
      // No active round or not in drawing phase
      setRoundWord('');
    }
  }, [currentGame?.currentWord, currentGame?.status, isDrawer]);
  
  // Render game content based on current game state
  const renderGameContent = () => {
    // No game exists yet
    if (!currentGame) {
      if (isRoomOwner) {
        return (
          <div className="waiting-container">
            <CreateGameForm />
          </div>
        );
      } else {
        return (
          <div className="waiting-container">
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
          <div className="waiting-container">
            <h2>Game is about to start!</h2>
            <p className="waiting-message">Get ready to play Pictionary.</p>
          </div>
        );
      
      case 'Drawing':
        return (
          <div className="game-area">
            <div className="game-content">
              <div className="game-header">
                <div className="room-name">{currentRoom?.name}</div>
                <div className="game-info">
                  <div className="round-info">
                    Round {currentGame.currentRound}/{currentGame.totalRounds}
                  </div>
                  <div className="word-display">{roundWord}</div>
                  <div className="timer">{timeLeft} seconds</div>
                </div>
                {isDrawer && (
                  <div className="drawer-indicator">You are drawing!</div>
                )}
              </div>
              
              <DrawingCanvas isDrawer={isDrawer} roomId={roomId} />
            </div>
            
            <ChatArea roomId={roomId} username={user.username} />
          </div>
        );
      
      case 'RoundEnd':
        return (
          <div className="waiting-container">
            <h2>Round {currentGame.currentRound} ended!</h2>
            <p className="waiting-message">Preparing for next round...</p>
          </div>
        );
      
      case 'GameEnd':
        return (
          <div className="waiting-container">
            <h2>Game Over!</h2>
            <p className="waiting-message">Thanks for playing!</p>
            {isRoomOwner && (
              <button 
                className="create-new-game-btn"
                onClick={() => {/* Clear current game if you want to start a new one */}}
              >
                Create New Game
              </button>
            )}
          </div>
        );
      
      default:
        return (
          <div className="waiting-container">
            <h2>Waiting for the game to start</h2>
            <p className="waiting-message">The game will begin soon.</p>
          </div>
        );
    }
  };
  
  return (
    <div className="game-container">
      {renderGameContent()}
    </div>
  );
}