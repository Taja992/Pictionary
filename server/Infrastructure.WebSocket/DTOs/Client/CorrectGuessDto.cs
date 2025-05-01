using Infrastructure.Websocket.DTOs;

namespace Infrastructure.WebSocket.DTOs.Server;

public class CorrectGuessDto : BaseDto
{
    public string GameId { get; set; } = string.Empty;
    public string RoomId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    
}