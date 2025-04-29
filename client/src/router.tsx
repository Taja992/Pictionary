// import { createBrowserRouter } from 'react-router-dom';
// import { ROUTES } from './routes';

// // Layouts
// import MainLayout from './pages/Layout/MainLayout';

// // Pages
// import HomePage from './pages/HomePage';
// import LobbyPage from './pages/LobbyPage';
// import RoomPage from './pages/RoomPage';
// import NotFoundPage from './pages/NotFoundPage';

// export const router = createBrowserRouter([
//   {
//     path: ROUTES.HOME,
//     element: <MainLayout />,
//     errorElement: <NotFoundPage />,
//     children: [
//       {
//         index: true,
//         element: <HomePage />
//       },
//       {
//         path: ROUTES.ROOMS,
//         element: <LobbyPage />
//       },
//       {
//         path: ROUTES.ROOM_DETAIL, 
//         element: <RoomPage />
//       }
//     ]
//   }
// ]);