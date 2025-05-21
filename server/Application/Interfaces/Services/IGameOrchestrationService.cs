using Core.Domain.Entities;


namespace Application.Interfaces.Services;

public interface IGameOrchestrationService
{
    Task<Game> CreateGameAsync(string roomId, int rounds, int timePerRound);
    Task<Game?> GetCurrentGameForRoomAsync(string roomId);
    Task<bool> AddPlayerToGameAsync(string gameId, string userId);

}