import { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import DrawingTools from './DrawingTools';

interface LineProps {
  points: number[];
  stroke: string;
  strokeWidth: number;
}

interface DrawingCanvasProps {
  isDrawer: boolean;
}

export default function DrawingCanvas({ isDrawer }: DrawingCanvasProps) {
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
      
      setLines([...lines, newLine]);
      
      // Here you would send the line via WebSocket
      // sendDrawingToServer(newLine);
      
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