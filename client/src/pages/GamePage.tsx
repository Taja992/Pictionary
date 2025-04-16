import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Stage, Layer, Line } from 'react-konva';
import './GamePage.css';

interface Player {
  id: string;
  name: string;
  score: number;
  isDrawing: boolean;
}

interface LineProps {
  points: number[];
  stroke: string;
  strokeWidth: number;
}

export default function GamePage() {
    const { roomId } = useParams<{ roomId: string }>();
    console.log('Room ID:', roomId); // Debug the roomId
    
    // Player state
    const [players, setPlayers] = useState<Player[]>([
      { id: '1', name: 'Player 1', score: 120, isDrawing: true },
      { id: '2', name: 'Player 2', score: 80, isDrawing: false },
      { id: '3', name: 'Player 3', score: 200, isDrawing: false },
      { id: '4', name: 'Player 4', score: 0, isDrawing: false }
    ]);
    
    // Game state
    const [round, setRound] = useState(1);
    const [maxRounds, setMaxRounds] = useState(3);
    const [timeLeft, setTimeLeft] = useState(80);
    const [word, setWord] = useState('_ _ _ _ _');
    const [isDrawing, setIsDrawing] = useState(false);
    
    // Chat state
    const [messages, setMessages] = useState([
      { id: '1', sender: 'System', text: 'Game has started!', isSystem: true },
      { id: '2', sender: 'Player 2', text: 'Hello everyone!', isSystem: false },
      { id: '3', sender: 'Player 3', text: 'Is this a dog?', isSystem: false },
    ]);
    const [newMessage, setNewMessage] = useState('');
    
    // Drawing state
    const [lines, setLines] = useState<LineProps[]>([]);
    const [currentLine, setCurrentLine] = useState<number[]>([]);
    const [currentColor, setCurrentColor] = useState('#000000');
    const [currentStrokeWidth, setCurrentStrokeWidth] = useState(5);
    const isDrawer = players.some(player => player.isDrawing && player.id === '1'); // Mock check if current user is drawer
    const stageRef = useRef(null);
    
    // Canvas dimensions
    const [canvasSize, setCanvasSize] = useState({
      width: 600,
      height: 500
    });
    
    // Set canvas size based on container dimensions
    useEffect(() => {
      const updateCanvasSize = () => {
        const container = document.querySelector('.canvas-container');
        if (container) {
          const { width, height } = container.getBoundingClientRect();
          setCanvasSize({
            width,
            height: Math.min(width, height)
          });
        }
      };
      
      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
      return () => window.removeEventListener('resize', updateCanvasSize);
    }, []);

    // Simulate timer countdown
    useEffect(() => {
      if (timeLeft > 0) {
        const timer = setTimeout(() => {
          setTimeLeft(timeLeft - 1);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [timeLeft]);
  
    // Drawing functions
    const handleMouseDown = (e) => {
      if (!isDrawer) return; // Only allow drawing if user is the drawer
      
      const pos = e.target.getStage().getPointerPosition();
      setIsDrawing(true);
      setCurrentLine([pos.x, pos.y]);
    };
    
    const handleMouseMove = (e) => {
      if (!isDrawing || !isDrawer) return;
      
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      
      setCurrentLine(currentLine => [...currentLine, point.x, point.y]);
    };
    
    const handleMouseUp = () => {
      if (!isDrawing || !isDrawer) return;
      
      setIsDrawing(false);
      
      if (currentLine.length) {
        const newLine = {
          points: currentLine,
          stroke: currentColor,
          strokeWidth: currentStrokeWidth
        };
        
        setLines([...lines, newLine]);
        
        // Here you would send the line via WebSocket
        // sendDrawingToServer(newLine);
        
        setCurrentLine([]);
      }
    };
    
    // Color selection
    const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    
    const handleColorChange = (color: string) => {
      setCurrentColor(color);
    };
    
    const handleSizeChange = (size: number) => {
      setCurrentStrokeWidth(size);
    };
    
    const handleClearCanvas = () => {
      setLines([]);
      // Send clear canvas command via WebSocket
    };
  
    // Handle sending a message
    const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim()) return;
      
      const newMsg = {
        id: Date.now().toString(),
        sender: localStorage.getItem('playerName') || 'You',
        text: newMessage,
        isSystem: false
      };
      
      setMessages([...messages, newMsg]);
      setNewMessage('');
      
      // Here you would check if the message is a correct guess
      // and send it to the WebSocket server
    };

    return (
      <div className="game-room-container">
        {/* Game Header */}
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
                style={{ width: `${(timeLeft / 80) * 100}%` }}
              ></div>
            </div>
          </div>
        </header>

        {/* Main Game Area */}
        <div className="game-area">
          {/* Player List */}
          <div className="player-list">
            <h2 className="player-list-title">Players</h2>
            <ul>
              {players.map(player => (
                <li 
                  key={player.id} 
                  className={`player-item ${player.isDrawing ? 'is-drawing' : ''}`}
                >
                  <span className="player-name">{player.name}</span>
                  <span className="player-score">{player.score}</span>
                  {player.isDrawing && <span className="drawing-indicator">✏️</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* Drawing Canvas */}
          <div className="canvas-container">
            {isDrawer && (
              <div className="drawing-tools">
                <div className="color-picker">
                  {colors.map(color => (
                    <div
                      key={color}
                      className={`color-swatch ${color === currentColor ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
                <div className="size-picker">
                  <button onClick={() => handleSizeChange(3)} className={`size-btn ${currentStrokeWidth === 3 ? 'active' : ''}`}>S</button>
                  <button onClick={() => handleSizeChange(5)} className={`size-btn ${currentStrokeWidth === 5 ? 'active' : ''}`}>M</button>
                  <button onClick={() => handleSizeChange(10)} className={`size-btn ${currentStrokeWidth === 10 ? 'active' : ''}`}>L</button>
                </div>
                <button onClick={handleClearCanvas} className="clear-btn">Clear</button>
              </div>
            )}
            
            <Stage
              width={canvasSize.width}
              height={canvasSize.height}
              onMouseDown={handleMouseDown}
              onMousemove={handleMouseMove}
              onMouseup={handleMouseUp}
              onMouseleave={handleMouseUp}
              onTouchstart={handleMouseDown}
              onTouchmove={handleMouseMove}
              onTouchend={handleMouseUp}
              ref={stageRef}
              className="drawing-stage"
            >
              <Layer>
                {lines.map((line, i) => (
                  <Line
                    key={i}
                    points={line.points}
                    stroke={line.stroke}
                    strokeWidth={line.strokeWidth}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                  />
                ))}
                {isDrawing && (
                  <Line
                    points={currentLine}
                    stroke={currentColor}
                    strokeWidth={currentStrokeWidth}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                  />
                )}
              </Layer>
            </Stage>
          </div>

          {/* Chat Area */}
          <div className="chat-container">
            <div className="chat-messages">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`chat-message ${msg.isSystem ? 'system-message' : ''}`}
                >
                  <span className="message-sender">{msg.sender}:</span>
                  <span className="message-text">{msg.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="chat-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="chat-input"
                placeholder="Type your guess..."
              />
              <button type="submit" className="chat-send-btn">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    );
}