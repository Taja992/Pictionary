import { ReactNode } from 'react';

interface RoomsContainerProps {
  children: ReactNode;
}

export default function RoomsContainer({ children }: RoomsContainerProps) {
  return (
    <div className="rooms-container">
      {children}
    </div>
  );
}