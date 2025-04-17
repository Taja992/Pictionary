
import RoomCard from './RoomCard';

interface Room {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
}

interface RoomsGridProps {
  rooms: Room[];
  onJoinRoom: (roomId: string) => void;
}

export default function RoomsGrid({ rooms, onJoinRoom }: RoomsGridProps) {
  return (
    <div className="rooms-grid">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          id={room.id}
          name={room.name}
          playerCount={room.playerCount}
          maxPlayers={room.maxPlayers}
          onJoin={() => onJoinRoom(room.id)}
        />
      ))}
    </div>
  );
}