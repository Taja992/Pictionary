using System.Text.Json.Serialization;
using Infrastructure.Websocket.DTOs;

namespace Api.WebSocket.DTOs;

public class DrawEventDto : BaseDto
{
    public string RoomId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    
    public LineData LineData { get; set; } = new LineData();
    
    // The flag to indicate if this is an in-progress line
    public bool isInProgress { get; set; } = false;
}

public class LineData
{
    public List<float> points { get; set; } = new List<float>();
    public string stroke { get; set; } = "#000000";
    public int strokeWidth { get; set; } = 5;
}