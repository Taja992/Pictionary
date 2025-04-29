namespace Infrastructure.Websocket.DTOs.Notifications.Game;


public class GameStartedDto : BaseDto
{
    public string GameId { get; set; } = string.Empty;
    public int CurrentRound { get; set; }

    public GameStartedDto(string gameId, int currentRound)
    {
        GameId = gameId;
        CurrentRound = currentRound;
    }
}