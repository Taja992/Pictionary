interface GameHeaderProps {
  roomName: string;
  round: number;
  maxRounds: number;
  word: string;
  timeLeft: number;
  gameStatus: string;
}

export default function GameHeader({ 
  roomName,
  round, 
  maxRounds, 
  word, 
  timeLeft,
  gameStatus 
}: GameHeaderProps) {
  return (
    <div className="game-header">
      <h1 className="room-name">{roomName}</h1>
      
      {gameStatus === 'in_progress' ? (
        <div className="game-info">
          <div className="round-info">
            Round {round}/{maxRounds}
          </div>
          <div className="word-display">
            {word ? word : '_ _ _ _ _'}
          </div>
          <div className="timer">
            {timeLeft} seconds
          </div>
        </div>
      ) : (
        <div className="game-status">
          {gameStatus === 'waiting' ? 'Waiting for game to start' : 'Game over'}
        </div>
      )}
    </div>
  );
}