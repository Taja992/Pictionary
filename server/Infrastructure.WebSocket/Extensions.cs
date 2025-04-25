using Application.Interfaces.Services;
using Microsoft.Extensions.DependencyInjection;
using Application.Interfaces.WebsocketInterfaces;
using Infrastructure.Websocket.DTOs;

namespace Infrastructure.Websocket;

public static class Extensions
{
    public static IServiceCollection AddWebSocketInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IConnectionManager, ConnectionManager>();
        services.AddScoped<IWebSocketHandler, WebSocketHandler>();
        services.AddScoped<IGameNotificationService, WebSocketGameNotificationService>();
        return services;
    }
}