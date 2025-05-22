using Application.Interfaces.Services;
using Microsoft.Extensions.DependencyInjection;
using Application.Interfaces.WebsocketInterfaces;
using Infrastructure.Websocket.Services;

namespace Infrastructure.Websocket;

public static class WebSocketInfrastructureExtensions
{
    public static void AddWebSocketInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IConnectionManager, ConnectionManager>();
        services.AddScoped<IWebSocketHandler, WebSocketHandler>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddSingleton<IMessageRouter, MessageRouter>();
        services.AddSingleton<IMessageService, MessageService>();
    }
}