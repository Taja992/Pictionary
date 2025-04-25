using Infrastructure.Websocket.DTOs;

namespace Api.WebSocket.DTOs;

public class RoomJoinDto : BaseDto
{
    public string RoomId { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string Username { get; set; } = null!;
}