namespace Infrastructure.Websocket.DTOs.Notifications.Game;


public class RoundEndedDto : BaseDto
{
    public string GameId { get; set; } = string.Empty;
    public int RoundNumber { get; set; }
    public int TotalRounds { get; set; }
    public bool IsLastRound { get; set; }
    public string CurrentWord { get; set; } = string.Empty;

    public RoundEndedDto(string gameId, int roundNumber, int totalRounds, bool isLastRound, string? currentWord)
    {
        GameId = gameId;
        RoundNumber = roundNumber;
        TotalRounds = totalRounds;
        IsLastRound = isLastRound;
        CurrentWord = currentWord ?? string.Empty;
    }
}