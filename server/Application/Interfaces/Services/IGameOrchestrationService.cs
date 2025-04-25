using Core.Domain.Entities;


namespace Application.Interfaces.Services;

public interface IGameOrchestrationService
{
    Task<Game> CreateGameAsync(string roomId, int rounds, int timePerRound);
    Task<Game?> GetCurrentGameForRoomAsync(string roomId);
    Task<Game> EndRoundAsync(string gameId);
    Task<bool> AssignDrawerAsync(string gameId, string userId);
    // Task<string> SelectWordForRoundAsync(string gameId, string? category = null);
    Task<bool> AddPlayerToGameAsync(string gameId, string userId);
}