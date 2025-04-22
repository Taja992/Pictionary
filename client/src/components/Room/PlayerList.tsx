import { useAtom } from 'jotai';
import { currentGameAtom, currentRoomAtom } from '../../atoms';
import { PlayerDto, ScoreDto } from '../../api/api-client';

interface PlayerListProps {
  players: PlayerDto[];
}

export default function PlayerList({ players }: PlayerListProps) {
  const [currentGame] = useAtom(currentGameAtom);
  const [currentRoom] = useAtom(currentRoomAtom);
  
  // Create a map of player scores from the current game
  const playerScores = new Map<string, number>();
  
  if (currentGame?.scores) {
    currentGame.scores.forEach(score => {
      if (score.userId) {
        playerScores.set(score.userId, score.points || 0);
      }
    });
  }
  
  // Determine who is currently drawing
  const currentDrawerId = currentGame?.currentDrawerId;
  
  return (
    <div className="player-list">
      <h2 className="player-list-title">Players</h2>
      <ul>
        {players.map(player => (
          <li 
            key={player.id} 
            className={`player-item ${player.id === currentDrawerId ? 'is-drawing' : ''}`}
          >
            <span className="player-name">{player.name}</span>
            <span className="player-score">{playerScores.get(player.id || '') || 0}</span>
            {player.id === currentDrawerId && <span className="drawing-indicator">✏️</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}