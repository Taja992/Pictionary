using Core.Domain.Entities;
using Application.Models.Results;

namespace Application.Interfaces.Services;

public interface IGameOrchestrationService
{
    Task<Game> CreateGameAsync(string roomId, int rounds, int timePerRound);
    Task<Game> StartGameAsync(string gameId);
    Task<Game> StartRoundAsync(string gameId);
    Task<Game> EndRoundAsync(string gameId);
    Task<Game> EndGameAsync(string gameId);
    Task<bool> AssignDrawerAsync(string gameId, string userId);
    Task<Word> SelectWordForRoundAsync(string gameId, string? category = null);
    Task<Game?> GetCurrentGameForRoomAsync(string roomId);
    Task<bool> AddPlayerToGameAsync(string gameId, string userId);
}