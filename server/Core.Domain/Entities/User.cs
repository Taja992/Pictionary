using System.ComponentModel.DataAnnotations;

namespace Core.Domain.Entities;


public class User
{
    public string Id { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int TotalGamesPlayed { get; set; } = 0;
    public int TotalGamesWon { get; set; } = 0;

    public List<Score> Scores { get; set; } = new List<Score>();
}