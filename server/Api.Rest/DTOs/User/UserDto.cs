using System.ComponentModel.DataAnnotations;

namespace Api.Rest.DTOs.User;

public class UserDto
{
    [Required]
    public string Id { get; set; } = null!;
    [Required]
    public string Username { get; set; } = null!;
    public int TotalGamesPlayed { get; set; }
    public int TotalGamesWon { get; set; }
}