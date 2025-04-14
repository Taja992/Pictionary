namespace Core.Domain.Entities;

public class Room
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string OwnerId { get; set; } = null!;
    public int MaxPlayers { get; set; } = 8;
    public bool IsPrivate { get; set; }
    public string? Password { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public RoomStatus Status { get; set; } = RoomStatus.Waiting;

    public User Owner { get; set; } = null!;
    public List<User> Players { get; set; } = new List<User>();
    public Game? CurrentGame { get; set; }
}

public enum RoomStatus
{
    Waiting,
    Playing,
    Finished
}