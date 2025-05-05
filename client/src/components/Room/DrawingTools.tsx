interface DrawingToolsProps {
  currentColor: string;
  currentStrokeWidth: number;
  currentWord?: string | null;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onClear: () => void;
}

export default function DrawingTools({
  currentColor,
  currentStrokeWidth,
  currentWord,
  onColorChange,
  onSizeChange,
  onClear
}: DrawingToolsProps) {
  const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
  
  return (
    <>
      <div className="drawing-tools">
        <div className="tool-group color-picker">
          {colors.map(color => (
            <div
              key={color}
              className={`color-swatch ${color === currentColor ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
            />
          ))}
        </div>
        
        <div className="tool-divider"></div>
        
        <div className="tool-group size-picker">
          <button 
            onClick={() => onSizeChange(3)} 
            className={`size-btn ${currentStrokeWidth === 3 ? 'active' : ''}`}
          >
            S
          </button>
          <button 
            onClick={() => onSizeChange(5)} 
            className={`size-btn ${currentStrokeWidth === 5 ? 'active' : ''}`}
          >
            M
          </button>
          <button 
            onClick={() => onSizeChange(10)} 
            className={`size-btn ${currentStrokeWidth === 10 ? 'active' : ''}`}
          >
            L
          </button>
        </div>
        
        <div className="tool-divider"></div>
        
        <div className="tool-group">
          <button onClick={onClear} className="clear-btn">Clear</button>
        </div>
      </div>
      
      {currentWord && (
        <div className="word-display-simple">
          Draw: <strong>{currentWord}</strong>
        </div>
      )}
    </>
  );
}