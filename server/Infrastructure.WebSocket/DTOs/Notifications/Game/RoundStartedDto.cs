namespace Infrastructure.Websocket.DTOs.Notifications.Game;


public class RoundStartedDto : BaseDto
{
    public string GameId { get; set; } = string.Empty;
    public int RoundNumber { get; set; }
    public int TotalRounds { get; set; }
    public string DrawerId { get; set; } = string.Empty;
    public string? StartTime { get; set; }
    public int DurationSeconds { get; set; }

    public RoundStartedDto(string gameId, int roundNumber, int totalRounds, string drawerId, string? startTime,
        int durationSeconds)
    {
        GameId = gameId;
        RoundNumber = roundNumber;
        TotalRounds = totalRounds;
        DrawerId = drawerId;
        StartTime = startTime;
        DurationSeconds = durationSeconds;
    }
}