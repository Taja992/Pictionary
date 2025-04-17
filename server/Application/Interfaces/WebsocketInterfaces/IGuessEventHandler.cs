namespace Application.Interfaces.WebsocketInterfaces;

public interface IGuessEventHandler
{
    Task HandleGuessEvent(string clientId, string guess);
}