import {  useEffect } from 'react';
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
  
  // Mock initial data
  useEffect(() => {
    // Initialize players list
    if (players.length === 0) {
      setPlayers([
        { id: '1', name: 'Player 1', score: 120, isDrawing: true },
        { id: '2', name: 'Player 2', score: 80, isDrawing: false },
        { id: '3', name: 'Player 3', score: 200, isDrawing: false },
        { id: '4', name: 'Player 4', score: 0, isDrawing: false }
      ]);
    }
    
    // Initialize messages
    if (messages.length === 0) {
      setMessages([
        { id: '1', sender: 'System', text: 'Game has started!', isSystem: true, timestamp: new Date() },
        { id: '2', sender: 'Player 2', text: 'Hello everyone!', isSystem: false, timestamp: new Date() },
        { id: '3', sender: 'Player 3', text: 'Is this a dog?', isSystem: false, timestamp: new Date() },
      ]);
    }
    
    // Initialize game settings if needed
    if (!currentGame.status) {
      setCurrentGame({
        ...currentGame,
        roomId: roomId || null,
        status: 'playing',
        currentRound: 1,
        totalRounds: 3,
        timeLeft: 80,
        isDrawer: true
      });
    }
  }, []);
  
  // Simulate timer countdown
  useEffect(() => {
    if (currentGame.timeLeft > 0 && currentGame.status === 'playing') {
      const timer = setTimeout(() => {
        setCurrentGame({
          ...currentGame,
          timeLeft: currentGame.timeLeft - 1
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentGame, setCurrentGame]);

  const handleSendMessage = (message: string) => {
    // Add message to local state
    const newMessage = {
      id: Date.now().toString(),
      sender: user.name || 'You',
      text: message,
      isSystem: false,
      timestamp: new Date()
    };
    
    setMessages([...messages, newMessage]);
    
    // In a real app, you would send this message to the WebSocket server
    console.log('Sending message:', message);
  };

  return (
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
        <DrawingCanvas isDrawer={currentGame.isDrawer} />
        <ChatArea initialMessages={messages} onSendMessage={handleSendMessage} />
      </div>
    </GameContainer>
  );
}