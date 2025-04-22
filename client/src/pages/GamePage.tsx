import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { 
  userAtom, 
  currentGameAtom, 
  playersAtom, 
  messagesAtom 
} from '../atoms';
import {
  GameContainer,
  GameHeader,
  PlayerList,
  DrawingCanvas,
  ChatArea
} from '../components/Game';
// Use the correct path to the WebSocketProvider
import WebSocketProvider from '../api/webSocketProvider';
import '../components/game/game.css';

export default function GamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [currentGame, setCurrentGame] = useAtom(currentGameAtom);
  const [user] = useAtom(userAtom);
  const [players, setPlayers] = useAtom(playersAtom);
  const [messages, setMessages] = useAtom(messagesAtom);
  
  // Set room ID in game state when component mounts
  useEffect(() => {
    if (roomId && roomId !== currentGame.roomId) {
      setCurrentGame({
        ...currentGame,
        roomId: roomId,
        status: 'waiting'
      });
    }
  }, [roomId, currentGame, setCurrentGame]);

  const handleSendMessage = (message: string) => {
    // This function can contain game-specific logic related to messages
    // like checking for correct guesses
    console.log('Message sent:', message);
  };

  return (
    <WebSocketProvider roomId={roomId}>
      <GameContainer>
        <GameHeader
          round={currentGame.currentRound}
          maxRounds={currentGame.totalRounds}
          word={currentGame.currentWord || '_ _ _ _ _'}
          timeLeft={currentGame.timeLeft}
          maxTime={80}
        />
        
        <div className="game-area">
          <PlayerList players={players} />
          <DrawingCanvas 
            isDrawer={currentGame.isDrawer} 
            roomId={roomId || ''}
          />
          <ChatArea 
            initialMessages={messages} 
            onSendMessage={handleSendMessage} 
            roomId={roomId || ''} 
            username={user.username || ''} 
          />
        </div>
      </GameContainer>
    </WebSocketProvider>
  );
}