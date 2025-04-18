namespace Api.Rest.DTOs.User;

public class UserDto
{
    public string Id { get; set; } = null!;
    public string Username { get; set; } = null!;
    public int TotalGamesPlayed { get; set; }
    public int TotalGamesWon { get; set; }
}