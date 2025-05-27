import { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { useAtom } from 'jotai';
import { userAtom, currentGameAtom } from '../../atoms';
import { useWsClient } from 'ws-request-hook';
import { ClearCanvasDto, DrawEventDto, MessageType, generateRequestId } from '../../api';
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

  interface CanvasSize {
    width: number;
    height: number;
  }
export default function DrawingCanvas({ isDrawer, roomId }: DrawingCanvasProps) {
  // Get current user
  const [user] = useAtom(userAtom);
  const [currentGame] = useAtom(currentGameAtom);
  const username = user.username || 'Anonymous';
  
  // Get WebSocket client
  const { send, onMessage } = useWsClient();
  
  // Drawing state
  const [lines, setLines] = useState<LineProps[]>([]);
  const [currentLine, setCurrentLine] = useState<number[]>([]);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    width: 600,
    height: 400
  });
  
  // Set canvas size based on container dimensions
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        
        // Account for padding/border (8px padding on each side = 16px total)
        const availableWidth = rect.width - 16;
        const availableHeight = rect.height - 16;
        
        setCanvasSize({
          width: availableWidth,
          height: availableHeight
        });
      }
    };
    
    updateCanvasSize();
    
    // Add resize observer for more accurate size tracking
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Also listen to window resize as a fallback
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // Listen for drawing events from other users
  useEffect(() => {
    if (!roomId) return;
    
    // Set up draw event handler
    const unsubscribeDraw = onMessage<DrawEventDto>(
      MessageType.DRAW_EVENT,
      (data) => {
        if (data.Username !== username) {
          const newLine = {
            points: data.LineData.points,
            stroke: data.LineData.stroke,
            strokeWidth: data.LineData.strokeWidth
          };
          
          setLines(prevLines => [...prevLines, newLine]);
        }
      }
    );
    
    // Set up clear canvas handler
    const unsubscribeClear = onMessage<ClearCanvasDto>(
      MessageType.CLEAR_CANVAS,
      (data) => {
        if (data.Username !== username) {
          setLines([]);
        }
      }
    );
    
    // Clean up subscriptions
    return () => {
      unsubscribeDraw();
      unsubscribeClear();
    };
  }, [roomId, username, onMessage]);

  // Drawing functions
  const handleMouseDown = (e: any) => {
    if (!isDrawer) return;
    const isValidDrawer = currentGame?.currentDrawerId === user.id && isDrawer;
    if (!isValidDrawer) return;
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
      
      // Generate a unique request ID
      const requestId = generateRequestId();
      
      // Send the line via WebSocket
      const drawEvent = {
        eventType: MessageType.DRAW_EVENT,
        requestId: requestId,
        RoomId: roomId,
        Username: username,
        LineData: newLine,
        IsInProgress: false
      };
      
      send(drawEvent);
      
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
    
    // Generate a unique request ID
    const requestId = generateRequestId();
    
    // Send clear canvas command via WebSocket
    const clearEvent = {
      eventType: MessageType.CLEAR_CANVAS,
      requestId: requestId,
      RoomId: roomId,
      Username: username
    };
    
    send(clearEvent);
  };

  return (
    <>
      {isDrawer && (
        <DrawingTools 
          currentColor={currentColor}
          currentStrokeWidth={currentStrokeWidth}
          currentWord={isDrawer ? currentGame?.currentWord : null}
          onColorChange={handleColorChange}
          onSizeChange={handleSizeChange}
          onClear={handleClearCanvas}
        />
      )}
      
      <div className="canvas-container" ref={containerRef}>
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
    </>
  );
}