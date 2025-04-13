using Application.Interfaces.Infrastructure.Websocket;

namespace Api.WebSocket.Handlers;

public class GuessEventHandler : IGuessEventHandler
{
    public Task HandleGuessEvent(string clientId, string guess)
    {
        // Empty implementation for now
        return Task.CompletedTask;
    }
}