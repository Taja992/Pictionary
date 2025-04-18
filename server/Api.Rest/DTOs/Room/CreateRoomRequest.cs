namespace Api.Rest.DTOs.Room;

public class CreateRoomRequest
{
    public string Name { get; set; } = null!;
    public string Username { get; set; } = null!; 
    public bool IsPrivate { get; set; } = false;
    public string? Password { get; set; }
}