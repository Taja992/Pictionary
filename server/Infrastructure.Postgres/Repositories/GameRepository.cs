using Application.Interfaces.Repositories;
using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class GameRepository : BaseRepository<Game>, IGameRepository
{
    public GameRepository(PictionaryDbContext context) : base(context)
    {
    }

    public override async Task<Game?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(g => g.Room)
            .Include(g => g.CurrentDrawer)
            .Include(g => g.Scores)
                .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(g => g.Id == id, cancellationToken);
    }

    public async Task<Game?> GetCurrentGameForRoomAsync(string roomId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(g => g.CurrentDrawer)
            .Include(g => g.Scores)
                .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(g => g.RoomId == roomId && g.Status != GameStatus.GameEnd, cancellationToken);
    }

    public override async Task<string> CreateAsync(Game game, CancellationToken cancellationToken = default)
    {
        return await base.CreateAsync(game, cancellationToken);
    }

    public override async Task UpdateAsync(Game game, CancellationToken cancellationToken = default)
    {
        await base.UpdateAsync(game, cancellationToken);
    }

    public async Task EndGameAsync(string gameId, DateTime endTime, CancellationToken cancellationToken = default)
    {
        var game = await GetByIdAsync(gameId, cancellationToken);
        if (game != null)
        {
            game.Status = GameStatus.GameEnd;
            game.EndTime = endTime;
            await UpdateAsync(game, cancellationToken);
        }
    }

    public override async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        await base.DeleteAsync(id, cancellationToken);
    }
}