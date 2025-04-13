using Application.Interfaces.Infrastructure.Websocket;
using Microsoft.Extensions.DependencyInjection;


namespace Infrastructure.WebSocket;

public static class Extensions
{
    public static IServiceCollection AddWebSocketInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IConnectionManager, ConnectionManager>();
        services.AddScoped<IWebSocketHandler, WebSocketHandler>();
        return services;
    }
}