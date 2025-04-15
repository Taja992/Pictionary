using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services;


public class DrawingPersistenceService : IDrawingPersistenceService
{
    public Task<Drawing?> GetDrawingAsync(string drawingId)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<Drawing>> GetDrawingsByGameAsync(string gameId)
    {
        throw new NotImplementedException();
    }

    public Task<string> SaveDrawingAsync(string gameId, string drawerId, string wordId, string drawingData)
    {
        throw new NotImplementedException();
    }
}
