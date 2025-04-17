using Infrastructure.WebSocket;

namespace Api.WebSocket.DTOs;

public class ChatMessageDto : BaseDto
{
    public string Message { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string RoomId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}