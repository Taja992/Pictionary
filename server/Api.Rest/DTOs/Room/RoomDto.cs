namespace Api.Rest.DTOs.Room;

public class RoomDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string OwnerId { get; set; } = null!;
    public string OwnerName { get; set; } = null!; 
    public int PlayerCount { get; set; }
    public int MaxPlayers { get; set; }
    public bool IsPrivate { get; set; }
    public string Status { get; set; } = null!;
    public List<PlayerDto> Players { get; set; } = new();
    public string? CurrentGameId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PlayerDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public bool IsOnline { get; set; }
}