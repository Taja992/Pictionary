using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Application.Models.Results;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;


namespace Application.Services;


public class RoomService : IRoomService
{
    public Task<Room> CreateRoomAsync(string name, string ownerId, bool isPrivate, string? password = null)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<Room>> GetAvailableRoomsAsync()
    {
        throw new NotImplementedException();
    }

    public Task<Room?> GetRoomAsync(string roomId)
    {
        throw new NotImplementedException();
    }

    public Task<JoinRoomResult> JoinRoomAsync(string roomId, string userId, string? password = null)
    {
        throw new NotImplementedException();
    }

    public Task<bool> LeaveRoomAsync(string roomId, string userId)
    {
        throw new NotImplementedException();
    }
}