using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Application.Models.Results;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class RoomService : IRoomService
{
    private readonly IRoomRepository _roomRepository;
    private readonly IUserRepository _userRepository;
    private readonly IGameOrchestrationService _gameService;
    private readonly ILogger<RoomService> _logger;
    private readonly INotificationService _notificationService;


    public RoomService(
        IRoomRepository roomRepository,
        IUserRepository userRepository,
        INotificationService notificationService,
        IGameOrchestrationService gameService,
        ILogger<RoomService> logger)
    {
        _roomRepository = roomRepository;
        _userRepository = userRepository;
        _gameService = gameService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<Room> CreateRoomAsync(string name, string ownerId, bool isPrivate, string? password = null)
    {
        _logger.LogInformation("Creating room: {Name} with owner: {OwnerId}", name, ownerId);
        
        var owner = await _userRepository.GetByIdAsync(ownerId);
        if (owner == null)
        {
            throw new ArgumentException($"User with ID {ownerId} not found", nameof(ownerId));
        }

        var room = new Room
        {
            Id = Guid.NewGuid().ToString(),
            Name = name,
            OwnerId = ownerId,
            Owner = owner,
            MaxPlayers = 8,
            IsPrivate = isPrivate,
            Password = password,
            Status = RoomStatus.Waiting,
            CreatedAt = DateTime.UtcNow,
            Players = new List<User> { owner } // Add owner as the first player
        };

        await _roomRepository.CreateAsync(room);

        await _notificationService.NotifyRoomCreated(room);
        return room;
    }

    public async Task<IEnumerable<Room>> GetAvailableRoomsAsync()
    {
        _logger.LogInformation("Getting available rooms");
        return await _roomRepository.GetAvailableRoomsAsync();
    }

    public async Task<Room?> GetRoomAsync(string roomId)
    {
        _logger.LogInformation("Getting room: {RoomId}", roomId);
        return await _roomRepository.GetByIdAsync(roomId);
    }

    public async Task<JoinRoomResult> JoinRoomAsync(string roomId, string userId, string? password = null, bool joinGame = true)
    {
        _logger.LogInformation("User {UserId} is joining room: {RoomId}", userId, roomId);

        var room = await _roomRepository.GetByIdAsync(roomId);


        if (room == null)
        {
            return JoinRoomResult.NotFound;
        }
        
        // Check if the room is private and requires a password
        if (room.IsPrivate && room.Password != password)
        {
            return JoinRoomResult.IncorrectPassword;
        }
        
        // Check if the room is full
        if (room.Players.Count >= room.MaxPlayers)
        {
            return JoinRoomResult.RoomFull;
        }
        
        // Check if the player is already in the room
        if (room.Players.Any(p => p.Id == userId))
        {
            // Player is already in the room
            // If there's an active game and joinGame is true, make sure they're also in the game
            if (joinGame && room.CurrentGame != null)
            {
                await _gameService.AddPlayerToGameAsync(room.CurrentGame.Id, userId);

                var player = room.Players.FirstOrDefault(p => p.Id == userId);
                string username = player?.Username ?? "Unknown";
                _logger.LogInformation("User {UserId} is already in the room and has been added to the game", userId);
                await _notificationService.NotifyJoinedGame(roomId, userId, username);
            }
            return JoinRoomResult.AlreadyJoined;
        }
        
        // Add player to room
        await _roomRepository.AddPlayerToRoomAsync(roomId, userId);
        
        // If there's an active game and joinGame is true, add the player to the game
        if (joinGame && room.CurrentGame != null)
        {
            await _gameService.AddPlayerToGameAsync(room.CurrentGame.Id, userId);

                var user = await _userRepository.GetByIdAsync(userId);
                string username = user?.Username ?? "Unknown";
                _logger.LogInformation("User {UserId} is joining the game in room: {RoomId}", userId, roomId);
                await _notificationService.NotifyJoinedGame(roomId, userId, username);
        }
        
        return JoinRoomResult.Success;
    }

    public async Task<bool> LeaveRoomAsync(string roomId, string userId)
    {
        _logger.LogInformation("User {UserId} is leaving room: {RoomId}", userId, roomId);
        
        var room = await _roomRepository.GetByIdAsync(roomId);
        if (room == null)
        {
            return false;
        }
        
        // If the user is the owner, delete the room
        if (room.OwnerId == userId)
        {
            await _roomRepository.DeleteAsync(roomId);
            
            await _notificationService.NotifyRoomDeleted(roomId);
            
            return true;
        }
        
        // Otherwise, just remove the player
        await _roomRepository.RemovePlayerFromRoomAsync(roomId, userId);
        return true;
    }
}