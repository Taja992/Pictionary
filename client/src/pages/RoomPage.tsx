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
  GameContainer,
  GameHeader,
  PlayerList,
  ChatArea,
  CreateGameForm
} from '../components/Room';
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
  const [messages ] = useAtom(messagesAtom);
  const [isRoomOwner] = useAtom(isRoomOwnerAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateGame, setShowCreateGame] = useState(false);
  
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
        } else if (isRoomOwner) {
          // If user is room owner and no game exists, show create game form
          setShowCreateGame(true);
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
  }, [roomId, navigate, setCurrentRoom, setCurrentGame, setPlayers, isRoomOwner]);


  const handleSendMessage = (message: string) => {
    // Keeping this as is
    console.log('Message sent:', message);
  };

  if (isLoading && !currentRoom) {
    return <div className="loading-container">Loading room...</div>;
  }

  return (
    <WebSocketProvider roomId={roomId}>
      <GameContainer>
        <GameHeader
          roomName={currentRoom?.name || 'Game Room'}
          round={currentGame?.currentRound || 0}
          maxRounds={currentGame?.totalRounds || 0}
          word={currentGame?.currentWordId || ''}
          timeLeft={currentGame?.roundTimeSeconds || 0}
          gameStatus={currentGame?.status || 'waiting'}
        />
        
        <div className="game-area">
          <PlayerList players={players} />
          
          {/* Game state display */}
          <div className="game-content-area">
            {!currentRoom?.currentGameId ? (
              <div className="waiting-container">
                {isRoomOwner ? (
                  showCreateGame ? (
                    <CreateGameForm 
                      onGameCreated={(gameId) => {
                        // This is optional - only needed if you want to do something after game creation
                        console.log(`Game ${gameId} was created`);
                        // Hide the create game form
                        setShowCreateGame(false);
                        // You might want to refresh room data here
                      }}
                    />
                  ) : (
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowCreateGame(true)}
                    >
                      Create Game
                    </button>
                  )
                ) : (
                  <div className="waiting-message">
                    <h3>Waiting for room owner to start the game...</h3>
                  </div>
                )}
              </div>
            ) : (
              <div className="canvas-placeholder">
                {/* Drawing canvas will go here later */}
                <div className="placeholder-text">Drawing area will appear here</div>
              </div>
            )}
          </div>
          
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