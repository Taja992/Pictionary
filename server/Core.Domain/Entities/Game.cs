using System.Diagnostics.Contracts;

namespace Core.Domain.Entities;

public class Game
{
    public string Id { get; set; } = null!;
    public string RoomId { get; set; } = null!;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public GameStatus Status { get; set; } = GameStatus.Starting;
    public int CurrentRound { get; set; } = 0;
    public int TotalRounds { get; set; } = 3;
    public string? CurrentDrawerId { get; set; }
    public string? CurrentWordId { get; set; }
    public int RoundTimeSeconds { get; set; } = 60;
    public DateTime? RoundStartTime { get; set; }

    public Room Room { get; set; } = null!;
    public User? CurrentDrawer { get; set; }
    public Word? CurrentWord { get; set; }
    public List<Score> Scores { get; set; } = new List<Score>();
    public List<Drawing> Drawings { get; set; } = new List<Drawing>();

}

public enum GameStatus
{
    Starting,
    Drawing,
    RoundEnd,
    GameEnd

}