using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Api.WebSocket.Handlers;
using Application.Interfaces.WebsocketInterfaces;

namespace Api.WebSocket;

/// <summary>
/// Extensions for configuring WebSocket functionality in the application.
/// 
/// Implementation Note:
/// This application uses ASP.NET Core's native WebSocket implementation rather than third-party
/// libraries like Fleck for several architectural advantages:
/// 
/// 1. Unified Infrastructure: Integrates directly with our main application, eliminating the need
///    to manage multiple servers or ports, which simplifies deployment and operations.
/// 
/// 2. Performance: Avoids the overhead of cross-process communication that would be required
///    with a separate WebSocket server.
/// 
/// 3. Security: Leverages the same security policies and middleware pipeline as the main application,
///    ensuring consistent security enforcement.
/// 
/// 4. Resource Management: Uses ASP.NET Core's built-in connection management which properly
///    handles backpressure and resource limits.
/// 
/// 5. Dependency Injection: Direct access to the application's service container allows
///    more efficient use of application services without crossing process boundaries.
/// 
/// 6. Simplified Development: Reduces cognitive load by keeping related code together and
///    following the established patterns of the rest of the application.
/// </summary>
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
                    var handler = context.RequestServices.GetRequiredService<IWebSocketHandler>();
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
        services.AddScoped<IRoomEventHandler, RoomEventHandler>(); 
        services.AddScoped<IDrawEventHandler, DrawEventHandler>();

        // Add other event handlers
        
        return services;
    }
}