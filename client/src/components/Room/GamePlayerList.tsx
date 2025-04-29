import { useAtom } from 'jotai';
import { gamePlayersAtom, roomPlayersAtom, currentGameAtom } from '../../atoms';

export default function GamePlayerList() {
  const [gamePlayers] = useAtom(gamePlayersAtom);
  const [roomPlayers] = useAtom(roomPlayersAtom);
  const [currentGame] = useAtom(currentGameAtom);
  
  // Create a set of room player IDs for quick lookup
  
  const roomPlayerIds = new Set(roomPlayers.map(p => p.id));
  
  return (
    <div className="player-list game-players">
      <h2 className="player-list-title">Game Players</h2>
      {gamePlayers.length === 0 ? (
        <div className="no-players">No players in game yet</div>
      ) : (
        <ul>
          {gamePlayers.map(player => {
            const isDrawing = player.id === currentGame?.currentDrawerId;
            const isInRoom = roomPlayerIds.has(player.id);
            
            return (
              <li 
                key={player.id} 
                className={`player-item ${isDrawing ? 'is-drawing' : ''} ${!isInRoom ? 'left-room' : ''}`}
              >
                <span className="player-name">{player.name}</span>
                {isDrawing && <span className="drawing-indicator">✏️</span>}
                {!isInRoom && <span className="left-room-indicator">🚶</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}