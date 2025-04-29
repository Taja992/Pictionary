import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './App.css';
import GlobalWebSocketProvider from './api/GlobalWebSocketProvider';

function App() {
  return (
    <GlobalWebSocketProvider>
      <RouterProvider router={router} />
    </GlobalWebSocketProvider>
  );
}

export default App;