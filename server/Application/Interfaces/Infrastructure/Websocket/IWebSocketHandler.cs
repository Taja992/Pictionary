

namespace Application.Interfaces.Infrastructure.Websocket;

public interface IWebSocketHandler
{
    Task ProcessWebSocketAsync(object context);
    Task SendMessageAsync(string clientId, string message);
    Task BroadcastMessageAsync(string message);
}