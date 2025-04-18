import { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { useAtom } from 'jotai';
import { userAtom } from '../../atoms';
import { websocketClient } from '../../api/websocket-client';
import { MessageType } from '../../api/websocket-types';
import DrawingTools from './DrawingTools';

interface LineProps {
  points: number[];
  stroke: string;
  strokeWidth: number;
}

interface DrawingCanvasProps {
  isDrawer: boolean;
  roomId: string;
}

export default function DrawingCanvas({ isDrawer, roomId }: DrawingCanvasProps) {
  // Get current user
  const [user] = useAtom(userAtom);
  const username = user.name || 'Anonymous';
  
  // Drawing state
  const [lines, setLines] = useState<LineProps[]>([]);
  const [currentLine, setCurrentLine] = useState<number[]>([]);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const stageRef = useRef<any>(null);
  
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

  // Listen for drawing events from other users
  useEffect(() => {
    // Handle draw events
    const handleDrawEvent = (data: any) => {
      if (data.Username !== username) { // Only process if from another user
        const newLine = {
          points: data.LineData.points,
          stroke: data.LineData.stroke,
          strokeWidth: data.LineData.strokeWidth
        };
        
        setLines(prevLines => [...prevLines, newLine]);
      }
    };
    
    // Handle clear canvas events
    const handleClearCanvas = (data: any) => {
      if (data.Username !== username) { // Only process if from another user
        setLines([]);
      }
    };
    
    // Subscribe to events
    websocketClient.on(MessageType.DRAW_EVENT, handleDrawEvent);
    websocketClient.on(MessageType.CLEAR_CANVAS, handleClearCanvas);
    
    // Cleanup
    return () => {
      websocketClient.off(MessageType.DRAW_EVENT, handleDrawEvent);
      websocketClient.off(MessageType.CLEAR_CANVAS, handleClearCanvas);
    };
  }, [username]);

  // Drawing functions
  const handleMouseDown = (e: any) => {
    if (!isDrawer) return; // Only allow drawing if user is the drawer
    
    const pos = e.target.getStage().getPointerPosition();
    setIsDrawing(true);
    setCurrentLine([pos.x, pos.y]);
  };
  
  const handleMouseMove = (e: any) => {
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
      
      // Add line to local state
      setLines([...lines, newLine]);
      
      // Send the line via WebSocket
      websocketClient.sendDrawEvent(newLine, username, roomId);
      
      setCurrentLine([]);
    }
  };
  
  const handleColorChange = (color: string) => {
    setCurrentColor(color);
  };
  
  const handleSizeChange = (size: number) => {
    setCurrentStrokeWidth(size);
  };
  
  const handleClearCanvas = () => {
    setLines([]);
    // Send clear canvas command via WebSocket
    websocketClient.sendClearCanvas(username, roomId);
  };

  return (
    <div className="canvas-container">
      {isDrawer && (
        <DrawingTools 
          currentColor={currentColor}
          currentStrokeWidth={currentStrokeWidth}
          onColorChange={handleColorChange}
          onSizeChange={handleSizeChange}
          onClear={handleClearCanvas}
        />
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
  );
}