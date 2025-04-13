using Application.Interfaces.Infrastructure.Websocket;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.WebSocket;

public class WebSocketHandler : IWebSocketHandler
{
    private readonly IConnectionManager _connectionManager;

    public WebSocketHandler(IConnectionManager connectionManager)
    {
        _connectionManager = connectionManager;
    }

    public Task ProcessWebSocketAsync(object context)
    {
        if (context is HttpContext httpContext)
        {
            // process the web socket
        }
        return Task.CompletedTask;
    }

    public Task SendMessageAsync(string clientId, string message)
    {
        return Task.CompletedTask;
    }

    public Task BroadcastMessageAsync(string message)
    {
        return Task.CompletedTask;
    }
}