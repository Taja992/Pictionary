using Infrastructure.Websocket.DTOs;

namespace Api.WebSocket.DTOs;

public class RoomUpdateDto : BaseDto
{
    public string RoomId { get; set; } = null!;
    public string Username { get; set; } = null!; 
    public string UserId { get; set; } = null!;   
    public RoomAction Action { get; set; }
}

public enum RoomAction
{
    Joined,
    Left
}