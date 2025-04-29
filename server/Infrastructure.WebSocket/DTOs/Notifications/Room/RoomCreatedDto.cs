namespace Infrastructure.Websocket.DTOs.Notifications.Room;

public class RoomCreatedDto : BaseDto
{
    public string RoomId { get; set; } = string.Empty;
    public string RoomName { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public bool IsPrivate { get; set; }

    public RoomCreatedDto(string roomId, string roomName, string ownerId, string ownerName, bool isPrivate)
    {
        RoomId = roomId;
        RoomName = roomName;
        OwnerId = ownerId;
        OwnerName = ownerName;
        IsPrivate = isPrivate;
    }
}