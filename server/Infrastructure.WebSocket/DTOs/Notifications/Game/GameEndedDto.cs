using Infrastructure.Websocket.DTOs;

namespace Infrastructure.WebSocket.DTOs.Notifications.Game;

public class GameEndedDto : BaseDto
{
    public string GameId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;

    public GameEndedDto(string gameId, string status)
    {
        GameId = gameId;
        Status = status;
    }
}