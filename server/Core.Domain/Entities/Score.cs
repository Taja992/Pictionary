namespace Core.Domain.Entities;

public class Score
{
    public string Id { get; set; } = null!;
    public string GameId { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public int Points { get; set; } = 0;
    public int DrawingPoints { get; set; } = 0;
    public int GuessingPoints { get; set; } = 0;
    public int RoundNumber { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Game Game { get; set; } = null!;
    public User User { get; set; } = null!;
}
