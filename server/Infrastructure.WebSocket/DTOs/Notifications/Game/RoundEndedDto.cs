namespace Infrastructure.Websocket.DTOs.Notifications.Game;


public class RoundEndedDto : BaseDto
{
    public string GameId { get; set; } = string.Empty;
    public int RoundNumber { get; set; }
    public int TotalRounds { get; set; }
    public bool IsLastRound { get; set; }

    public RoundEndedDto(string gameId, int roundNumber, int totalRounds, bool isLastRound)
    {
        GameId = gameId;
        RoundNumber = roundNumber;
        TotalRounds = totalRounds;
        IsLastRound = isLastRound;
    }
}