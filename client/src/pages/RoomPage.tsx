import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { 
  userAtom, 
  currentGameAtom, 
  currentRoomAtom,
  messagesAtom,
  roomPlayersAtom,
  gamePlayersAtom
} from '../atoms';
import api from '../api/api';
import {
  GameHeader,
  ChatArea
} from '../components/Room';
import DrawingArea from '../components/Room/DrawingArea';
import '../components/Room/game.css';
import toast from 'react-hot-toast';
import GamePlayerList from '../components/Room/GamePlayerList';
import RoomPlayerList from '../components/Room/RoomList';
import RoomWebSocketHandler from '../api/RoomWebSocketHandler';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  // Early return if roomId is undefined
  if (!roomId) {
    useEffect(() => {
      navigate('/rooms');
    }, [navigate]);
    
    return <div className="loading-container">Invalid room. Redirecting...</div>;
  }
  
  const [currentGame, setCurrentGame] = useAtom(currentGameAtom);
  const [currentRoom, setCurrentRoom] = useAtom(currentRoomAtom);
  const [user] = useAtom(userAtom);
  const [messages] = useAtom(messagesAtom);
  const [, setRoomPlayers] = useAtom(roomPlayersAtom);
  const [, setGamePlayers] = useAtom(gamePlayersAtom);
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
        
        // Update room players list from room data
        if (roomResponse.data.players) {
          setRoomPlayers(roomResponse.data.players);
        }
        
        // If room has an active game, fetch game details
        if (roomResponse.data.currentGameId) {
          if (roomResponse.data.id) {
            const gameResponse = await api.api.gameOrchestrationGetCurrentGameForRoom(roomResponse.data.id);
            setCurrentGame(gameResponse.data);
            
            // Initialize game players from scores
            if (gameResponse.data.scores) {
              const gamePlayers = gameResponse.data.scores.map((score: any) => ({
                id: score.userId,
                name: score.username
              }));
              
              setGamePlayers(gamePlayers);
            }
          }
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
      setRoomPlayers([]);
      setGamePlayers([]);
    };
  }, [roomId, navigate, setCurrentRoom, setCurrentGame, setRoomPlayers, setGamePlayers]);

  const handleSendMessage = (message: string) => {
    console.log('Message sent:', message);
  };

  if (isLoading && !currentRoom) {
    return <div className="loading-container">Loading room...</div>;
  }

  return (
    <RoomWebSocketHandler roomId={roomId}>
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
          <div className="players-section">
            <GamePlayerList />
            <RoomPlayerList />
          </div>
          
          <DrawingArea roomId={roomId || ''} />
          
          <ChatArea 
            initialMessages={messages} 
            onSendMessage={handleSendMessage} 
            roomId={roomId || ''} 
            username={user.username || ''} 
          />
        </div>
      </div>
    </RoomWebSocketHandler>
  );
}