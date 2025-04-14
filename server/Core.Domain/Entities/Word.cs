namespace Core.Domain.Entities;


public class Word
{
    public string Id { get; set; } = null!;
    public string Text { get; set; } = null!;
    public Difficulty Difficulty { get; set; } = Difficulty.Easy;
    public string? Category { get; set; }
    public int TimesUsed { get; set; } = 0;

    public List<Game> Games { get; set; } = new List<Game>();
}

public enum Difficulty
{
    Easy,
    Medium,
    Hard
}