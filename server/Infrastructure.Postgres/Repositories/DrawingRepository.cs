using Application.Repositories;
using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class DrawingRepository : BaseRepository<Drawing>, IDrawingRepository
{
    public DrawingRepository(PictionaryDbContext context) : base(context)
    {
    }

    public override async Task<Drawing?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await base.GetByIdAsync(id, cancellationToken);
    }

    public async Task<IEnumerable<Drawing>> GetByGameIdAsync(string gameId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.GameId == gameId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Drawing>> GetByDrawerIdAsync(string drawerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.DrawerId == drawerId)
            .ToListAsync(cancellationToken);
    }

    public override async Task<string> CreateAsync(Drawing drawing, CancellationToken cancellationToken = default)
    {
        return await base.CreateAsync(drawing, cancellationToken);
    }

    public override async Task UpdateAsync(Drawing drawing, CancellationToken cancellationToken = default)
    {
        await base.UpdateAsync(drawing, cancellationToken);
    }

    public override async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        await base.DeleteAsync(id, cancellationToken);
    }
}