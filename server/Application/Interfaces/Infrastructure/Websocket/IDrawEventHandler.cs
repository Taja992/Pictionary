namespace Application.Interfaces.Infrastructure.Websocket;

public interface IDrawEventHandler
{
    Task HandleDrawEvent(string clientId, string drawingData);
}