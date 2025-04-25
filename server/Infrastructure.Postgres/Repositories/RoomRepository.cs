using Application.Interfaces.Repositories;
using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Websocket.DTOs.DTOs.Postgres.Repositories;

public class RoomRepository : BaseRepository<Room>, IRoomRepository
{
    public RoomRepository(PictionaryDbContext context) : base(context)
    {
    }

    public override async Task<Room?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.Owner)
            .Include(r => r.Players)
            .Include(r => r.CurrentGame)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Room>> GetAvailableRoomsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.Owner)
            .Include(r => r.Players)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Room>> GetRoomsByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.Owner)
            .Include(r => r.Players)
            .Where(r => r.OwnerId == userId || r.Players.Any(p => p.Id == userId))
            .ToListAsync(cancellationToken);
    }

    public override async Task<string> CreateAsync(Room room, CancellationToken cancellationToken = default)
    {
        return await base.CreateAsync(room, cancellationToken);
    }

    public override async Task UpdateAsync(Room room, CancellationToken cancellationToken = default)
    {
        await base.UpdateAsync(room, cancellationToken);
    }

    public async Task AddPlayerToRoomAsync(string roomId, string playerId, CancellationToken cancellationToken = default)
    {
        var room = await GetByIdAsync(roomId, cancellationToken);
        var player = await _context.Users.FindAsync([playerId], cancellationToken);
        
        if (room != null && player != null)
        {
            if (!room.Players.Any(p => p.Id == playerId))
            {
                room.Players.Add(player);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }

    public async Task RemovePlayerFromRoomAsync(string roomId, string playerId, CancellationToken cancellationToken = default)
    {
        var room = await GetByIdAsync(roomId, cancellationToken);
        var playerToRemove = room?.Players.FirstOrDefault(p => p.Id == playerId);
        
        if (room != null && playerToRemove != null)
        {
            room.Players.Remove(playerToRemove);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public override async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        await base.DeleteAsync(id, cancellationToken);
    }
}