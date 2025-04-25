import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { 
  userAtom, 
  currentGameAtom, 
  currentRoomAtom,
  isRoomOwnerAtom,
  playersAtom, 
  messagesAtom 
} from '../atoms';
import api from '../api/api';
import {
  GameHeader,
  PlayerList,
  ChatArea
} from '../components/Room';
import DrawingArea from '../components/Room/DrawingArea'; // This is your new component
import WebSocketProvider from '../api/webSocketProvider';
import '../components/room/game.css';
import toast from 'react-hot-toast';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [currentGame, setCurrentGame] = useAtom(currentGameAtom);
  const [currentRoom, setCurrentRoom] = useAtom(currentRoomAtom);
  const [user] = useAtom(userAtom);
  const [players, setPlayers] = useAtom(playersAtom);
  const [messages] = useAtom(messagesAtom);
  const [isRoomOwner] = useAtom(isRoomOwnerAtom);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch room data when component mounts
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) {
        navigate('/rooms');
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get room details
        const roomResponse = await api.api.roomGetRoom(roomId);
        setCurrentRoom(roomResponse.data);
        
        // If room has an active game, fetch game details
        if (roomResponse.data.currentGameId) {
          if (roomResponse.data.id) {
            const gameResponse = await api.api.gameOrchestrationGetCurrentGameForRoom(roomResponse.data.id);
            setCurrentGame(gameResponse.data);
          } else {
            console.error('Room ID is undefined.');
          }
        }
        
        // Update players list from room data
        if (roomResponse.data.players) {
          setPlayers(roomResponse.data.players);
        }
        
      } catch (err) {
        console.error('Error fetching room data:', err);
        toast.error('Could not load the room. Redirecting to lobby...');
        navigate('/rooms');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRoomData();
    
    // Clean up when unmounting
    return () => {
      setCurrentRoom(null);
      setCurrentGame(null);
    };
  }, [roomId, navigate, setCurrentRoom, setCurrentGame, setPlayers]);

  const handleSendMessage = (message: string) => {
    // Keeping this as is
    console.log('Message sent:', message);
  };

  if (isLoading && !currentRoom) {
    return <div className="loading-container">Loading room...</div>;
  }

  return (
    <WebSocketProvider roomId={roomId}>
      <div className="game-container">
        <GameHeader
          roomName={currentRoom?.name || 'Game Room'}
          round={currentGame?.currentRound || 0}
          maxRounds={currentGame?.totalRounds || 0}
          word={currentGame?.currentWord || ''}
          timeLeft={currentGame?.roundTimeSeconds || 0}
          gameStatus={currentGame?.status || 'waiting'}
        />
        
        <div className="game-area">
          <PlayerList players={players} />
          
          {/* This is where we place the DrawingArea that handles game state */}
          <DrawingArea roomId={roomId || ''} />
          
          <ChatArea 
            initialMessages={messages} 
            onSendMessage={handleSendMessage} 
            roomId={roomId || ''} 
            username={user.username || ''} 
          />
        </div>
      </div>
    </WebSocketProvider>
  );
}