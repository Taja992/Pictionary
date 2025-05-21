using Application.Interfaces.Repositories;
using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class ScoreRepository : BaseRepository<Score>, IScoreRepository
{
    public ScoreRepository(PictionaryDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Score>> GetByGameIdAsync(string gameId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(s => s.GameId == gameId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Score>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(s => s.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public async Task<Score?> GetByGameAndUserAsync(string gameId, string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(s => s.GameId == gameId && s.UserId == userId, cancellationToken);
    }

    public override async Task<string> CreateAsync(Score score, CancellationToken cancellationToken = default)
    {
        return await base.CreateAsync(score, cancellationToken);
    }

    public override async Task UpdateAsync(Score score, CancellationToken cancellationToken = default)
    {
        await base.UpdateAsync(score, cancellationToken);
    }

    public async Task<Score?> GetScoreForRoundAsync(string gameId, string userId, int roundNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(s =>
             s.GameId == gameId &&
             s.UserId == userId &&
             s.Round == roundNumber,
             cancellationToken);
    }

    public async Task<IEnumerable<Score>> GetScoresByGameAndUserAsync(string gameId, string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(s => s.GameId == gameId && s.UserId == userId)
            .ToListAsync(cancellationToken);
    }
}