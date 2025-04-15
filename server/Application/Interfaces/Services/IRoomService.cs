using Core.Domain.Entities;
using Application.Models.Results;

namespace Application.Interfaces.Services;

public interface IRoomService
{
    Task<Room> CreateRoomAsync(string name, string ownerId, bool isPrivate, string? password = null);
    Task<Room?> GetRoomAsync(string roomId);
    Task<JoinRoomResult> JoinRoomAsync(string roomId, string userId, string? password = null);
    Task<bool> LeaveRoomAsync(string roomId, string userId);
    Task<IEnumerable<Room>> GetAvailableRoomsAsync();
}