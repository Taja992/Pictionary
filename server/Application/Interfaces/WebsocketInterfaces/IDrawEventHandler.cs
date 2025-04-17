namespace Application.Interfaces.WebsocketInterfaces;
public interface IDrawEventHandler
{
    Task HandleDrawEvent(string clientId, string drawingData);
}