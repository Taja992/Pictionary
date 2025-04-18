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
            var rooms = await _connectionManager.GetRoomsFromClientId(clientId);
            string roomId = chatMessage.RoomId ?? (rooms.Count > 0 ? rooms.First() : string.Empty);
            
            if (!string.IsNullOrEmpty(roomId))
            {
                // Simply broadcast through the connection manager
                await _connectionManager.BroadcastToRoom(roomId, messageJson);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error handling chat message: {ex.Message}");
        }
    }
}