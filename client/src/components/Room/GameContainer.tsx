import { ReactNode } from 'react';

interface GameContainerProps {
  children: ReactNode;
}

export default function GameContainer({ children }: GameContainerProps) {
  return (
    <div className="game-room-container">
      {children}
    </div>
  );
}