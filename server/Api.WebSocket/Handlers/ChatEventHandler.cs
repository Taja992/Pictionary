using System.Text.Json;
using Api.WebSocket.DTOs;
using Application.Interfaces.WebsocketInterfaces;

namespace Api.WebSocket.Handlers;

public class ChatEventHandler : IChatEventHandler 
{
    private readonly IConnectionManager _connectionManager;
    
    public ChatEventHandler(IConnectionManager connectionManager)
    {
        _connectionManager = connectionManager;
    }

    public async Task HandleChatEvent(string clientId, string messageJson)
    {
        try
        {
            // Parse the message using the standalone DTO
            var chatMessage = JsonSerializer.Deserialize<ChatMessageDto>(messageJson);
            if (chatMessage == null) return;
            
            // Get the room to broadcast to
            var topics = await _connectionManager.GetTopicsFromMemberId(clientId);
            string roomId = chatMessage.RoomId ?? (topics.Count > 0 ? topics.First() : string.Empty);
            
            if (!string.IsNullOrEmpty(roomId))
            {
                // Simply broadcast through the connection manager
                await _connectionManager.BroadcastToTopic(roomId, messageJson);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error handling chat message: {ex.Message}");
        }
    }
}