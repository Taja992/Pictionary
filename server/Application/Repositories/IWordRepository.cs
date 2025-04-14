using Core.Domain.Entities;

namespace Application.Repositories;

public interface IWordRepository
{
    Task<Word?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<Word?> GetRandomWordAsync(string? category = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<Word>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<string> CreateAsync(Word word, CancellationToken cancellationToken = default);
    Task UpdateAsync(Word word, CancellationToken cancellationToken = default);
    Task IncrementUsageCountAsync(string id, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
}