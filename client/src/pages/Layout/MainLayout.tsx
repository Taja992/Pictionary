import { Outlet, Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../../atoms';
import { LobbyRoute } from '../../routeConstants';
import './MainLayout.css';
import WebSocketConnectionIndicator from '../../WebSocketConnectionIndicator';

export default function MainLayout() {
  const [user] = useAtom(userAtom);

  return (
    <div className="layout-container">
      {/* Header */}
      <header className="layout-header">
        <div className="header-content">
          <h2 className="header-welcome">
            {user.username ? `Welcome, ${user.username}!` : 'Welcome!'}
          </h2>
          <div className="header-nav">
            <Link to={LobbyRoute} className="header-nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Rooms</span>
            </Link>
            <WebSocketConnectionIndicator />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}