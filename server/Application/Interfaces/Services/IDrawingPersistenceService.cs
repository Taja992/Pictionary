using Core.Domain.Entities;

namespace Application.Interfaces.Services;

public interface IDrawingPersistenceService
{
    Task<Drawing?> GetDrawingAsync(string drawingId);
    Task<IEnumerable<Drawing>> GetDrawingsByGameAsync(string gameId);
    Task<string> SaveDrawingAsync(string gameId, string drawerId, string wordId, string drawingData);
}