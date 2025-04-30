using Application.Interfaces.Services;
using Application.Interfaces.WebsocketInterfaces;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Infrastructure.Websocket.DTOs;
using Infrastructure.Websocket.DTOs.Notifications.Game;
using Infrastructure.WebSocket.DTOs.Notifications.Game;
using Infrastructure.Websocket.DTOs.Notifications.Room;

namespace Infrastructure.Websocket.Services;

/// <summary>
/// Service that sends real-time game event notifications to clients via WebSockets
/// </summary>
public class NotificationService : INotificationService
{
    private readonly IConnectionManager _connectionManager;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IConnectionManager connectionManager,
        ILogger<NotificationService> logger)
    {
        _connectionManager = connectionManager;
        _logger = logger;
    }

    /// <summary>
    /// Notifies all clients in a room that a new game has been created
    /// </summary>
    public async Task NotifyGameCreated(string roomId, Game game)
    {
        try
        {
            var notification = new GameCreatedDto(
                game.Id,
                game.Status.ToString(),
                game.TotalRounds,
                game.RoundTimeSeconds
            );
            
            await _connectionManager.BroadcastToRoom(roomId, notification);
            
            _logger.LogInformation("Notified room {RoomId} of game creation", roomId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to notify game created for room {RoomId}", roomId);
        }
    }

    /// <summary>
    /// Notifies all clients in a room that a game has started
    /// </summary>
    public async Task NotifyGameStarted(string roomId, Game game)
    {
        try
        {
            var notification = new GameStartedDto(
                game.Id,
                game.CurrentRound
            );
            

            await _connectionManager.BroadcastToRoom(roomId, notification);
            
            _logger.LogInformation("Notified room {RoomId} of game start", roomId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to notify game started for room {RoomId}", roomId);
        }
    }

    public async Task NotifyJoinedGame(string roomId, string userId, string username)
    {
        try
        {
            var notification = new JoinedGameDto(
                roomId,
                userId,
                username
                );

            await _connectionManager.BroadcastToRoom(roomId, notification);

            _logger.LogInformation("Notified room {RoomId} of username: {Username} joining game", roomId, username);

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to notify player joined game for room {RoomId}", roomId);
        }
    }

    /// <summary>
    /// Notifies all clients in a room that a round has started
    /// </summary>
    public async Task NotifyRoundStarted(string roomId, Game game)
    {
        try
        {
            var notification = new RoundStartedDto(
                game.Id,
                game.CurrentRound,
                game.TotalRounds,
                game.CurrentDrawerId ?? string.Empty,
                game.RoundStartTime?.ToString("o"),
                game.RoundTimeSeconds
            );
            

            await _connectionManager.BroadcastToRoom(roomId, notification);
            
            _logger.LogInformation("Notified room {RoomId} of round {Round} start", roomId, game.CurrentRound);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to notify round started for room {RoomId}", roomId);
        }
    }

    /// <summary>
    /// Sends the word to draw to the designated drawer
    /// </summary>
    public async Task SendWordToDrawer(string drawerId, string word)
    {
        try
        {
            var notification = new DrawerWordDto(word);
            
            // Get active connections for this user
            var clients = await _connectionManager.GetClientIdsForUser(drawerId);
            foreach (var clientId in clients)
            {
                // This method doesnt have the generic capabilities
                // that my broadcastToRoom does so we serialize first
                var jsonMessage = JsonSerializer.Serialize(notification);
                await _connectionManager.SendToClient(clientId, jsonMessage);
            }
            
            _logger.LogInformation("Sent word to drawer {DrawerId}", drawerId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send word to drawer {DrawerId}", drawerId);
        }
    }

    /// <summary>
    /// Notifies all clients in a room that a round has ended
    /// </summary>
    public async Task NotifyRoundEnded(string roomId, Game game)
    {
        try
        {
            var notification = new RoundEndedDto(
                game.Id,
                game.CurrentRound,
                game.TotalRounds,
                game.CurrentRound >= game.TotalRounds
            );
            

            await _connectionManager.BroadcastToRoom(roomId, notification);
            
            _logger.LogInformation("Notified room {RoomId} of round {Round} end", roomId, game.CurrentRound);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to notify round ended for room {RoomId}", roomId);
        }
    }

    /// <summary>
    /// Notifies all clients in a room that a game has ended
    /// </summary>
    public async Task NotifyGameEnded(string roomId, Game game)
    {
        try
        {
            var notification = new GameEndedDto(
                game.Id,
                game.Status.ToString()
            );
            
            await _connectionManager.BroadcastToRoom(roomId, notification);
            
            _logger.LogInformation("Notified room {RoomId} of game end", roomId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to notify game ended for room {RoomId}", roomId);
        }
    }

    /// <summary>
    /// Notifies all clients in a room about which player is the drawer
    /// </summary>
    public async Task NotifyDrawerSelected(string roomId, string drawerId, string drawerName)
    {
        try
        {
            var notification = new DrawerSelectedDto(drawerId, drawerName);
            
            await _connectionManager.BroadcastToRoom(roomId, notification);
            
            _logger.LogInformation("Notified room {RoomId} of drawer selection: {DrawerName}", roomId, drawerName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to notify drawer selected for room {RoomId}", roomId);
        }
    }

    public async Task NotifyRoomCreated(Room room)
    {
        try
        {
            var notification = new RoomCreatedDto(
                room.Id,
                room.Name,
                room.OwnerId,
                room.Owner?.Username ?? "Unknown",
                room.IsPrivate
            );
            
            await _connectionManager.BroadcastToRoom("lobby", notification);
            
            _logger.LogInformation("Broadcast room creation: {RoomId}", room.Id);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Failed to notify room creation for {RoomId}", room.Id);
        }
    }

    public async Task NotifyRoomDeleted(string roomId)
    {
        try
        {
            var notification = new RoomDeletedDto(roomId);

            await _connectionManager.BroadcastToRoom("lobby", notification);

            _logger.LogInformation("Broadcast room deleted: {RoomId}", roomId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to notify room deleted for room {RoomId}", roomId);
        }
    }
}