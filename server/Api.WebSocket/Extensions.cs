using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using Api.WebSocket.Handlers;
using Application.Interfaces.WebsocketInterfaces;

namespace Api.WebSocket;

public static class Extensions
{
    public static IApplicationBuilder UseWebSocketApi(this IApplicationBuilder app)
    {
        app.UseWebSockets(new WebSocketOptions
        {
            KeepAliveInterval = TimeSpan.FromMinutes(2)
        });
        
        // Register WebSocket endpoint
        app.Use(async (context, next) =>
        {
            if (context.Request.Path == "/ws")
            {
                if (context.WebSockets.IsWebSocketRequest)
                {
                    var handler = context.RequestServices.GetRequiredService<IWebSocketHandler>(); // Changed GetService to GetRequiredService
                    await handler.ProcessWebSocketAsync(context);
                }
                else
                {
                    context.Response.StatusCode = 400;
                }
            }
            else
            {
                await next();
            }
        });
        
        return app;
    }
    
    public static IServiceCollection AddWebSocketApi(this IServiceCollection services)
    {
        services.AddScoped<IDrawEventHandler, DrawEventHandler>();
        services.AddScoped<IChatEventHandler, ChatEventHandler>(); 
        // Add other event handlers
        
        return services;
    }
}