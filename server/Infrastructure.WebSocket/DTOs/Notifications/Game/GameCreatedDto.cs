

using Infrastructure.Websocket.DTOs;

namespace Infrastructure.WebSocket.DTOs.Notifications.Game;

public class GameCreatedDto : BaseDto
{
    public string GameId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int TotalRounds { get; set; }
    public int TimePerRound { get; set; }

    public GameCreatedDto(string gameId, string status, int totalRounds, int timePerRound)
    {
        GameId = gameId;
        Status = status;
        TotalRounds = totalRounds;
        TimePerRound = timePerRound;
    }
}