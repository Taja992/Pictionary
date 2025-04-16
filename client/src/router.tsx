import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from './routes';

// Layouts
import MainLayout from './pages/Layout/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import GamePage from './pages/GamePage';
import NotFoundPage from './pages/NotFoundPage';

// Create router with route configurations
export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: ROUTES.ROOMS,
        element: <RoomsPage />
      },
      {
        path: ROUTES.ROOM_DETAIL, 
        element: <GamePage />
      }
    ]
  }
]);