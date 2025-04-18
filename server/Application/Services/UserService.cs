using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository userRepository, ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<User> GetOrCreateTemporaryUserAsync(string username)
    {
        // Try to find existing user with this username
        var existingUser = await _userRepository.GetByUsernameAsync(username);
        
        // If user exists and was created in the last 24 hours, return it
        if (existingUser != null && existingUser.CreatedAt > DateTime.UtcNow.AddHours(-24))
        {
            return existingUser;
        }
        
        // If user exists but is older than 24 hours, delete it (we'll create a new one)
        if (existingUser != null)
        {
            await _userRepository.DeleteAsync(existingUser.Id);
        }
        
        // Create a new temporary user
        var user = new User
        {
            Id = Guid.NewGuid().ToString(),
            Username = username,
            // Set dummy values for required fields
            Email = $"{Guid.NewGuid()}@temporary.game",
            PasswordHash = "temporary",
            CreatedAt = DateTime.UtcNow,
            TotalGamesPlayed = 0,
            TotalGamesWon = 0
        };
        
        await _userRepository.CreateAsync(user);
        _logger.LogInformation("Created temporary user: {Username}", username);
        
        return user;
    }

    public async Task<User?> GetUserByIdAsync(string id)
    {
        return await _userRepository.GetByIdAsync(id);
    }

    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        return await _userRepository.GetByUsernameAsync(username);
    }

    public async Task<bool> UpdateUserStatsAsync(string id, bool isWinner)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return false;
        }
        
        user.TotalGamesPlayed++;
        if (isWinner)
        {
            user.TotalGamesWon++;
        }
        
        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task CleanupTemporaryUsersAsync()
    {
        var allUsers = await _userRepository.GetAllAsync();
        var expiredUsers = allUsers.Where(u => u.CreatedAt < DateTime.UtcNow.AddHours(-24));
        
        foreach (var user in expiredUsers)
        {
            _logger.LogInformation("Deleting expired temporary user: {Username}", user.Username);
            await _userRepository.DeleteAsync(user.Id);
        }
    }
}