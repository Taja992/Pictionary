using Infrastructure.WebSocket;

namespace Api.WebSocket.DTOs;


public class RoomLeaveDto : BaseDto
{
    public string RoomId { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string Username { get; set; } = null!;
}