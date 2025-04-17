

namespace Application.Interfaces.WebsocketInterfaces;

public interface IWebSocketHandler
{
    Task ProcessWebSocketAsync(object context);
    Task SendMessageAsync(string clientId, string message);
    Task BroadcastMessageAsync(string message);
}