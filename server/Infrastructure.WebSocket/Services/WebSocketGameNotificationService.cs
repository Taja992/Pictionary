using Application.Interfaces.Services;
using Application.Interfaces.WebsocketInterfaces;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Infrastructure.Websocket.DTOs;

namespace Infrastructure.Websocket.DTOs;

/// <summary>
/// Service that sends real-time game event notifications to clients via WebSockets
/// </summary>
public class WebSocketGameNotificationService : IGameNotificationService
{
    private readonly IConnectionManager _connectionManager;
    private readonly ILogger<WebSocketGameNotificationService> _logger;

    public WebSocketGameNotificationService(
        IConnectionManager connectionManager,
        ILogger<WebSocketGameNotificationService> logger)
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
            var notification = new GameCreatedNotification(
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
            var notification = new GameStartedNotification(
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

    /// <summary>
    /// Notifies all clients in a room that a round has started
    /// </summary>
    public async Task NotifyRoundStarted(string roomId, Game game)
    {
        try
        {
            var notification = new RoundStartedNotification(
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
            var notification = new DrawerWordNotification(word);
            
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
            var notification = new RoundEndedNotification(
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
            var notification = new GameEndedNotification(
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
            var notification = new DrawerSelectedNotification(drawerId, drawerName);
            
            await _connectionManager.BroadcastToRoom(roomId, notification);
            
            _logger.LogInformation("Notified room {RoomId} of drawer selection: {DrawerName}", roomId, drawerName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to notify drawer selected for room {RoomId}", roomId);
        }
    }
}