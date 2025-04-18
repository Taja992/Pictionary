import { useAtom } from 'jotai';
import { webSocketStatusAtom } from '../../atoms';

export default function WebSocketConnectionIndicator() {
  const [wsStatus] = useAtom(webSocketStatusAtom);

  // Helper function to get the appropriate text
  const getStatusText = () => {
    switch (wsStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Connection Error';
      default: return 'Unknown';
    }
  };

  // Helper function to get the appropriate CSS class
  const getStatusClass = () => {
    switch (wsStatus) {
      case 'connected': return 'bg-success';
      case 'connecting': return 'bg-warning';
      case 'disconnected': return 'bg-error';
      case 'error': return 'bg-error';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${getStatusClass()}`}></div>
      <span className="text-sm">{getStatusText()}</span>
    </div>
  );
}