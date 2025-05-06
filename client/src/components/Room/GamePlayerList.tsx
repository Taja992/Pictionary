import { useAtom } from 'jotai';
import { gamePlayersAtom, roomPlayersAtom, currentGameAtom } from '../../atoms';
import { useEffect, useState } from 'react';
import './GamePlayerList.css';

export default function GamePlayerList() {
  const [gamePlayers] = useAtom(gamePlayersAtom);
  const [roomPlayers] = useAtom(roomPlayersAtom);
  const [currentGame] = useAtom(currentGameAtom);
  
  // Track players who recently scored for animations
  const [recentlyScored, setRecentlyScored] = useState<Record<string, boolean>>({});
  
  // Create a set of room player IDs for quick lookup
  const roomPlayerIds = new Set(roomPlayers.map(p => p.id));
  
  // Handle animations for recent scores
  useEffect(() => {
    // Find players who have scored in the last 3 seconds
    const justScored: Record<string, boolean> = {};
    
    gamePlayers.forEach(player => {
      if (player.lastScoreTime && 
          Date.now() - new Date(player.lastScoreTime).getTime() < 3000) {
        justScored[player.id!] = true;
      }
    });
    
    setRecentlyScored(justScored);
    
    // Clear animations after 3 seconds
    const timer = setTimeout(() => {
      setRecentlyScored({});
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [gamePlayers]);
  
  // Sort players by score (highest first)
  const sortedPlayers = [...gamePlayers].sort((a, b) => 
    (b.totalPoints || 0) - (a.totalPoints || 0)
  );
  
  return (
    <div className="player-list game-players">
      <h2 className="player-list-title">Players & Scores</h2>
      {sortedPlayers.length === 0 ? (
        <div className="no-players">No players in game yet</div>
      ) : (
        <ul className="score-list">
          {sortedPlayers.map(player => {
            const isDrawing = player.id === currentGame?.currentDrawerId;
            const isInRoom = roomPlayerIds.has(player.id!);
            const hasRecentScore = recentlyScored[player.id!];
            
            return (
              <li 
                key={player.id} 
                className={`player-item ${isDrawing ? 'is-drawing' : ''} 
                             ${!isInRoom ? 'left-room' : ''} 
                             ${hasRecentScore ? 'recent-score' : ''}`}
              >
                <div className="player-info">
                  <span className="player-name">{player.name}</span>
                  <span className="player-score">
                    {player.totalPoints || 0} pts
                    {hasRecentScore && player.lastPointsGained && (
                      <span className="points-gained">+{player.lastPointsGained}</span>
                    )}
                  </span>
                </div>
                
                <div className="player-status">
                  {isDrawing && <span className="drawing-indicator" title="Currently Drawing">✏️</span>}
                  {!isInRoom && <span className="left-room-indicator" title="Left Room">🚶</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}