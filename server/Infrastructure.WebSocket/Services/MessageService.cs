using System.Text;
using System.Text.Json;
using Application.Interfaces.Services;
using Application.Interfaces.WebsocketInterfaces;
using Infrastructure.Websocket.DTOs;
using Microsoft.Extensions.Logging;
using System.Net.WebSockets;
// Using this System.Net.Websockets for WebSocketState.Open & WebSocketMessageType.Text

namespace Infrastructure.Websocket.Services;

public class MessageService : IMessageService
{
    private readonly IConnectionManager _connectionManager;
    private readonly ILogger<MessageService> _logger;

    public MessageService(IConnectionManager connectionManager, ILogger<MessageService> logger)
    {
        _connectionManager = connectionManager;
        _logger = logger;
    }
    
    public async Task SendToClient(string clientId, string message)
    {
        if (string.IsNullOrEmpty(clientId))
        {
            _logger.LogWarning("Attempted to send message to empty clientId.");
            return;
        }
        
        var socket = _connectionManager.GetSocketFromClientId(clientId) as System.Net.WebSockets.WebSocket;
        if (socket == null || socket.State != WebSocketState.Open)
        {
            _logger.LogWarning("Cannot send message to client {ClientId}: socket not found or not open", clientId);
            return;
        }

        try
        {
            // 1. Convert string message to a byte array that can be sent over the network
            // UTF-8 encoding handles international characters, emojis, etc.
            var buffer = System.Text.Encoding.UTF8.GetBytes(message);
        
            // 2. Send the byte array via WebSocket using SendAsync method
            await socket.SendAsync(
                // ArraySegment is a memory-efficient way to reference a portion of an array
                // without creating a copy. It's like saying "use this section of the buffer"
                // Parameters: 
                //   - buffer: the source byte array 
                //   - 0: start from the beginning of the array (index 0)
                //   - buffer.Length: use the entire length of the array
                new ArraySegment<byte>(buffer, 0, buffer.Length),
            
                // 3. Specify this is a text message (not binary data or control frame)
                // This tells the receiver (browser/client) how to interpret the bytes
                WebSocketMessageType.Text,
            
                // 4. true = "endOfMessage" - indicates this is a complete message
                // WebSockets can fragment large messages across multiple frames
                // Setting this to true means "this is the final fragment"
                true,
            
                // 5. CancellationToken.None means we won't cancel this operation
                // In a more advanced implementation, you might pass a token
                // that could cancel long-running send operations
                CancellationToken.None
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message to client {ClientId}: {Message}", clientId, message);
        }
    }
    
    public async Task SendToClient<TMessage>(string clientId, TMessage message) where TMessage : class
    {
        if (message is string stringMessage)
        {
            await SendToClient(clientId, stringMessage);
        }
        else
        {
            // serialize using system.text.json
            var jsonMessage = JsonSerializer.Serialize(message);
            await SendToClient(clientId, jsonMessage);
        }
    }


    public async Task BroadcastToRoom(string room, string message)
    {
        if (string.IsNullOrEmpty(room))
        {
            _logger.LogWarning("Attempted to send message to empty room.");
            return;
        }

        var clients = await _connectionManager.GetClientsFromRoomId(room);

        if (clients.Count == 0)
        {
            _logger.LogInformation("No clients found in room {Room}", room);
            return;
        }

        var successCount = 0;
        foreach (var clientId in clients)
        {
            try
            {
                await SendToClient(clientId, message);
                successCount++;
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Failed to send message to client {ClientId} in room {Room}", clientId, room);
            }
        }
        _logger.LogDebug("Broadcasted message to {Count}/{Total} clients in room {Room}", successCount, clients.Count, room);
    }

    /// <summary>
    /// Broadcasts a message to all clients in a specific room
    /// </summary>
    /// <typeparam name="TMessage">Type of message (string or object inheriting from BaseDto)</typeparam>
    /// <param name="room">The room to broadcast to</param>
    /// <param name="message">The message to send</param>
    /// <remarks>
    /// TMessage allows different types of messages:
    /// - String messages: BroadcastToRoom("game1", "Hello everyone");
    /// - DTO objects: BroadcastToRoom("game1", new ChatMessageDto { Message = "Hello" });
    ///   (These automatically get the proper eventType through BaseDto inheritance)
    /// - Custom classes: These should inherit from BaseDto to ensure proper eventType assignment
    /// </remarks>
    public async Task BroadcastToRoom<TMessage>(string room, TMessage message) where TMessage : class
    {
        if (message is string stringMessage)
        {
            await BroadcastToRoom(room, stringMessage);
            return;
        }

        try
        {
            var jsonMessage = JsonSerializer.Serialize(message);
            await BroadcastToRoom(room, jsonMessage);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error serializing message for room broadcast to {Room}", room);
        }
    }
}