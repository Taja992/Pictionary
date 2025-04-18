using Core.Domain.Entities;

namespace Application.Interfaces.Services;

public interface IUserService
{
    Task<User> GetOrCreateTemporaryUserAsync(string username);
    Task<User?> GetUserByIdAsync(string id);
    Task<User?> GetUserByUsernameAsync(string username);
    Task<bool> UpdateUserStatsAsync(string id, bool isWinner);
    Task CleanupTemporaryUsersAsync();
}