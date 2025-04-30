using Infrastructure.Websocket.DTOs;

namespace Infrastructure.WebSocket.DTOs.Notifications.Game;

public class JoinedGameDto : BaseDto
{
    public string RoomId { get; set; }
    public string UserId { get; set; }
    public string Username { get; set; }

    public JoinedGameDto(string roomId, string userId, string username)
    {
        RoomId = roomId;
        UserId = userId;
        Username = username;
    }
}