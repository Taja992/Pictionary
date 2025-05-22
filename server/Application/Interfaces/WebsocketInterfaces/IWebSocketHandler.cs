

namespace Application.Interfaces.WebsocketInterfaces;

public interface IWebSocketHandler
{
    Task ProcessWebSocketAsync(object context);

}