namespace Application.Interfaces.WebsocketInterfaces;


public interface IChatEventHandler
{
    Task HandleChatEvent(string clientId, string messageJson);
}