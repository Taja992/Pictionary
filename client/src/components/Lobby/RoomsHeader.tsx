

interface RoomsHeaderProps {
  onCreateRoom: () => void;
}

export default function RoomsHeader({ onCreateRoom }: RoomsHeaderProps) {
  return (
    <div className="rooms-header">
      <h1 className="rooms-title">Game Rooms</h1>
      <button className="btn btn-primary" onClick={onCreateRoom}>
        Create Room
      </button>
    </div>
  );
}