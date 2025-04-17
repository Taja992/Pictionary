import { ReactNode } from 'react';

interface HomeContainerProps {
  children: ReactNode;
}

export default function HomeContainer({ children }: HomeContainerProps) {
  return (
    <div className="home-container">
      <div className="home-content">
        {children}
      </div>
    </div>
  );
}