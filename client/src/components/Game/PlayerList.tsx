

interface Player {
  id: string;
  name: string;
  score: number;
  isDrawing: boolean;
}

interface PlayerListProps {
  players: Player[];
}

export default function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="player-list">
      <h2 className="player-list-title">Players</h2>
      <ul>
        {players.map(player => (
          <li 
            key={player.id} 
            className={`player-item ${player.isDrawing ? 'is-drawing' : ''}`}
          >
            <span className="player-name">{player.name}</span>
            <span className="player-score">{player.score}</span>
            {player.isDrawing && <span className="drawing-indicator">✏️</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}