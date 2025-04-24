namespace Application.Interfaces.WebsocketInterfaces;


public interface IRoomEventHandler
{
    Task HandleJoinRoomEvent(string clientId, string messageJson);
    Task HandleLeaveRoomEvent(string clientId, string messageJson);
}