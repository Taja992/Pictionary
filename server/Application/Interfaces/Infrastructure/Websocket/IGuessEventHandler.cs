namespace Application.Interfaces.Infrastructure.Websocket;

public interface IGuessEventHandler
{
    Task HandleGuessEvent(string clientId, string guess);
}