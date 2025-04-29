import { useAtom } from 'jotai';
import { roomPlayersAtom, gamePlayersAtom, currentGameAtom } from '../../atoms';

export default function RoomPlayerList() {
  const [roomPlayers] = useAtom(roomPlayersAtom);
  const [gamePlayers] = useAtom(gamePlayersAtom);
  const [currentGame] = useAtom(currentGameAtom);
  
  // Create a set of game player IDs for quick lookup
  const gamePlayerIds = new Set(gamePlayers.map(p => p.id));
  
  return (
    <div className="player-list room-players">
      <h2 className="player-list-title">Room Players</h2>
      {roomPlayers.length === 0 ? (
        <div className="no-players">No players in room</div>
      ) : (
        <ul>
          {roomPlayers.map(player => {
            const isDrawing = player.id === currentGame?.currentDrawerId;
            const isInGame = gamePlayerIds.has(player.id);
            
            return (
              <li 
                key={player.id} 
                className={`player-item ${isDrawing ? 'is-drawing' : ''} ${isInGame ? 'in-game' : ''}`}
              >
                <span className="player-name">{player.name}</span>
                {isDrawing && <span className="drawing-indicator">✏️</span>}
                {isInGame && <span className="in-game-indicator">🎮</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}