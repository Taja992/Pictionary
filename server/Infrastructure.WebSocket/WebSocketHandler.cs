using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Application.Interfaces.WebsocketInterfaces;

namespace Infrastructure.WebSocket;

public class WebSocketHandler : IWebSocketHandler
{
    private readonly IConnectionManager _connectionManager;
    private readonly ILogger<WebSocketHandler> _logger;
    private readonly IDrawEventHandler _drawEventHandler;
    private readonly IChatEventHandler _chatEventHandler;
    private readonly IRoomEventHandler _roomEventHandler;

    public WebSocketHandler(
        IConnectionManager connectionManager,
        ILogger<WebSocketHandler> logger,
        IDrawEventHandler drawEventHandler,
        IRoomEventHandler roomEventHandler,
        IChatEventHandler chatEventHandler)
    {
        _connectionManager = connectionManager;
        _logger = logger;
        _drawEventHandler = drawEventHandler;
        _chatEventHandler = chatEventHandler;
        _roomEventHandler = roomEventHandler;
    }

    public async Task ProcessWebSocketAsync(object context)
    {
        if (context is HttpContext httpContext && httpContext.WebSockets.IsWebSocketRequest)
        {

            string userId = httpContext.Request.Query["userId"].ToString();
            string username = httpContext.Request.Query["username"].ToString();

            string clientId = Guid.NewGuid().ToString();

            var webSocket = await httpContext.WebSockets.AcceptWebSocketAsync();
            
            await _connectionManager.OnOpen(webSocket, clientId, userId, username);

            try
            {
                await ReceiveMessagesAsync(webSocket, clientId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing WebSocket for client {ClientId}", clientId);
            }
            finally
            {
                // Ensure connection is properly closed and resources are cleaned up
                await _connectionManager.OnClose(webSocket, clientId);
            }
        }
        else
        {
            _logger.LogError("Received invalid context or non-WebSocket request");
        }
    }

    private async Task ReceiveMessagesAsync(System.Net.WebSockets.WebSocket webSocket, string clientId)
    {
        var buffer = new byte[4096];
        WebSocketReceiveResult result;

        while (webSocket.State == WebSocketState.Open)
        {
            try
            {
                result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                    break;
                }

                if (result.MessageType == WebSocketMessageType.Text)
                {
                    string message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    await HandleMessageAsync(webSocket, clientId, message);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error receiving message from client {ClientId}", clientId);
                break;
            }
        }
    }

    private async Task HandleMessageAsync(System.Net.WebSockets.WebSocket webSocket, string clientId, string message)
    {
        try
        {
            
            var baseMessage = JsonSerializer.Deserialize<BaseDto>(message);
            
            if (baseMessage == null)
            {
                _logger.LogWarning("Received invalid message format from {ClientId}", clientId);
                return;
            }
            // Route the message based on eventType
            switch (baseMessage.eventType)
            {
                case "DRAW_LINE":
                case "CLEAR_CANVAS":
                    await _drawEventHandler.HandleDrawEvent(clientId, message);
                    break;
                    
                case "ChatMessage":
                    await _chatEventHandler.HandleChatEvent(clientId, message);
                    break;

                case "RoomJoin":
                    await _roomEventHandler.HandleJoinRoomEvent(clientId, message);
                    break;
                
                case "RoomLeave":
                    await _roomEventHandler.HandleLeaveRoomEvent(clientId, message);
                    break;
                
 
                    
                default:
                    _logger.LogWarning("Unhandled message type: {MessageType}", baseMessage.eventType);
                    break;
            }
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Error deserializing message: {Message}", message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing message");
        }
    }

    public async Task SendMessageAsync(string clientId, string message)
    {
        var webSocket = _connectionManager.GetSocketFromClientId(clientId) as System.Net.WebSockets.WebSocket;
        if (webSocket != null && webSocket.State == WebSocketState.Open)
        {
            var buffer = Encoding.UTF8.GetBytes(message);
            await webSocket.SendAsync(
                new ArraySegment<byte>(buffer, 0, buffer.Length),
                WebSocketMessageType.Text,
                true,
                CancellationToken.None);
        }
        else
        {
            _logger.LogWarning("Cannot send message to client {ClientId}: socket not found or not open", clientId);
        }
    }

    public async Task BroadcastMessageAsync(string message)
    {
        var socketDictionary = _connectionManager.GetConnectionIdToSocketDictionary();
        
        foreach (var clientId in socketDictionary.Keys)
        {
            await SendMessageAsync(clientId, message);
        }
    }

    private class BaseMessageDto
    {
        public string Type { get; set; } = string.Empty;
    }

    private class BaseDto
    {
        public string eventType { get; set; } = string.Empty;
    }

    private class JoinRoomDto : BaseDto
    {
        public string RoomId { get; set; } = string.Empty;
    }
}