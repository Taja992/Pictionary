namespace Infrastructure.Websocket.DTOs.Notifications.Room;

public class RoomDeletedDto : BaseDto
{
    public string RoomId { get; set; } = string.Empty;

    public RoomDeletedDto(string roomId)
    {
        RoomId = roomId;
    }
}