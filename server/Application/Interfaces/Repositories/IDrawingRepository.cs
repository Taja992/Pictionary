using Core.Domain.Entities;

namespace Application.Interfaces.Repositories;

public interface IDrawingRepository
{
    Task<Drawing?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Drawing>> GetByGameIdAsync(string gameId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Drawing>> GetByDrawerIdAsync(string drawerId, CancellationToken cancellationToken = default);
    Task<string> CreateAsync(Drawing drawing, CancellationToken cancellationToken = default);
    Task UpdateAsync(Drawing drawing, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
}