
interface RoomCardProps {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  onJoin: () => void;
}

export default function RoomCard({ name, playerCount, maxPlayers, onJoin }: RoomCardProps) {
  return (
    <div className="room-card">
      <div className="card-body">
        <h2 className="card-title">{name}</h2>
        <p className="card-info">Players: {playerCount}/{maxPlayers}</p>
        <div className="card-actions">
          <button 
            onClick={onJoin}
            className="btn btn-sm btn-primary"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}