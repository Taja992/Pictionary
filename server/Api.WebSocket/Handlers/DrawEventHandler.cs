using System.Text.Json;
using Application.Interfaces.WebsocketInterfaces;
using Infrastructure.WebSocket.DTOs.Client;
using Microsoft.Extensions.Logging;

namespace Api.WebSocket.Handlers;

public class DrawEventHandler : IDrawEventHandler
{

    private readonly IConnectionManager _connectionManager;
    private readonly ILogger<DrawEventHandler> _logger;

    public DrawEventHandler(
        IConnectionManager connectionManager,
        ILogger<DrawEventHandler> logger)
    {
        _connectionManager = connectionManager;
        _logger = logger;
    }


    public async Task HandleDrawEvent(string clientId, string drawingData)
    {
        try
        {
            //deserialize the data to a DrawEventDto object
            //So we can access the roomId
            var drawEvent = JsonSerializer.Deserialize<DrawEventDto>(drawingData);
            if (drawEvent == null)
            {
                _logger.LogWarning("Invalid drawing data clientId: {ClientId}, data: {Data}", clientId, drawingData);
                return;
            }

            var roomId = drawEvent.RoomId;
            if (string.IsNullOrEmpty(roomId))
            {
                var rooms = await _connectionManager.GetRoomsFromClientId(clientId);
                roomId = rooms.Count > 0 ? rooms.First() : string.Empty;
            }

            if (!string.IsNullOrEmpty(roomId))
            {
                // Broadcast the drawing data to all clients in the room
                await _connectionManager.BroadcastToRoom(roomId, drawingData);

                if (!drawEvent.isInProgress)
                {
                    _logger.LogDebug("Broadcast drawing from {Username} to room {RoomId}", drawEvent.Username, roomId);
                }
            }
            else
            {
                _logger.LogWarning("Cannot broadcast drawing - no room found for client {ClientId: {ClientId}", clientId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling draw event for client {ClientId}: {Message}", clientId, ex.Message);
        }
    }
}