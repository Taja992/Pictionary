import { useWsClient } from "ws-request-hook";
import "./WebSocketConnectionIndicator.css";

export default function WebsocketConnectionIndicator() {
  const { readyState } = useWsClient();
  
  const isConnected = readyState === 1;
  const statusText = isConnected ? "Connected" : "Disconnected";
  const indicatorClass = isConnected ? "indicator-green" : "indicator-red";
  
  return (
    <div className="connection-status">
      <div className={`status-indicator ${indicatorClass}`}></div>
      <span className="status-text">{statusText}</span>
    </div>
  );
}