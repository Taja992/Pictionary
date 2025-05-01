using Core.Domain.Entities;

namespace Application.Interfaces.Repositories;

public interface IScoreRepository
{
    Task<Score?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Score>> GetByGameIdAsync(string gameId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Score>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<Score?> GetByGameAndUserAsync(string gameId, string userId, CancellationToken cancellationToken = default);
    Task<string> CreateAsync(Score score, CancellationToken cancellationToken = default);
    Task UpdateAsync(Score score, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
    Task<Score?> GetScoreForRoundAsync(string gameId, string userId, int roundNumber, CancellationToken cancellationToken = default);
    Task<IEnumerable<Score>> GetScoresByGameAndUserAsync(string gameId, string userId, CancellationToken cancellationToken = default);
}