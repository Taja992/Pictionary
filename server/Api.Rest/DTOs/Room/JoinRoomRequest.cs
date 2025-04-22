namespace Api.Rest.DTOs.Room;

public class JoinRoomRequest
{
    public string UserId { get; set; } = null!;
    public string? Password { get; set; }
    public bool JoinGame { get; set; } = true;
}