using Application.Interfaces.Infrastructure.Websocket;

namespace Api.WebSocket.Handlers;

public class DrawEventHandler : IDrawEventHandler
{
    public Task HandleDrawEvent(string clientId, string drawingData)
    {
        // Empty implementation for now
        return Task.CompletedTask;
    }
}