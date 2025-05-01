namespace Infrastructure.Websocket.DTOs.Notifications.Game;

public class UpdateScoreDto : BaseDto
{
    public string GameId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public int PointsGained { get; set; }
    public int TotalPoints { get; set; }

    public UpdateScoreDto(string gameId, string userId, int pointsGained, int totalPoints)
    {
        GameId = gameId;
        UserId = userId;
        PointsGained = pointsGained;
        TotalPoints = totalPoints;
    }

}