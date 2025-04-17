

interface GameHeaderProps {
  round: number;
  maxRounds: number;
  word: string;
  timeLeft: number;
  maxTime: number;
}

export default function GameHeader({ 
  round, 
  maxRounds, 
  word, 
  timeLeft,
  maxTime 
}: GameHeaderProps) {
  return (
    <header className="game-header">
      <div className="round-info">
        <span>Round {round} of {maxRounds}</span>
      </div>
      <div className="word-display">
        <span>{word}</span>
      </div>
      <div className="timer-container">
        <div className="timer-value">{timeLeft}s</div>
        <div className="timer-bar">
          <div 
            className="timer-progress" 
            style={{ width: `${(timeLeft / maxTime) * 100}%` }}
          ></div>
        </div>
      </div>
    </header>
  );
}