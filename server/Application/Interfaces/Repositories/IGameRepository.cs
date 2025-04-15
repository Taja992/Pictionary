using Core.Domain.Entities;

namespace Application.Interfaces.Repositories;

public interface IGameRepository
{
    Task<Game?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<Game?> GetCurrentGameForRoomAsync(string roomId, CancellationToken cancellationToken = default);
    Task<string> CreateAsync(Game game, CancellationToken cancellationToken = default);
    Task UpdateAsync(Game game, CancellationToken cancellationToken = default);
    Task EndGameAsync(string gameId, DateTime endTime, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
}