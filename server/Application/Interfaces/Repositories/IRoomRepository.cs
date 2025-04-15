using Core.Domain.Entities;

namespace Application.Interfaces.Repositories;

public interface IRoomRepository
{
    Task<Room?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Room>> GetAvailableRoomsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Room>> GetRoomsByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<string> CreateAsync(Room room, CancellationToken cancellationToken = default);
    Task UpdateAsync(Room room, CancellationToken cancellationToken = default);
    Task AddPlayerToRoomAsync(string roomId, string playerId, CancellationToken cancellationToken = default);
    Task RemovePlayerFromRoomAsync(string roomId, string playerId, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
}