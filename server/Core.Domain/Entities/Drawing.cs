namespace Core.Domain.Entities;

public class Drawing
{
    public string Id { get; set; } = null!;
    public string GameId { get; set; } = null!;
    public string DrawerId { get; set; } = null!;
    public string WordId { get; set; } = null!;
    public string DrawingData { get; set; } = null!; // This will be a json representation of the drawing
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Game Game { get; set; } = null!;
    public User Drawer { get; set; } = null!;
    public Word Word { get; set; } = null!;
}