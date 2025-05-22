using System.Text.Json;
using Application.Interfaces.Services;
using Application.Interfaces.WebsocketInterfaces;
using Infrastructure.Websocket.DTOs;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Websocket.Services;

/// <summary>
/// Routes WebSocket messages to the appropriate event handlers based on the event type.
/// </summary>
/// <remarks>
/// This class is registered as a singleton service but needs to work with scoped services
/// (event handlers). To properly manage scoped services from a singleton, we create a new
/// service scope for each message being processed.
///
/// This pattern ensures that:
/// 1. Each message gets its own isolated dependency scope
/// 2. Scoped dependencies are properly created and disposed
/// 3. We avoid the "Cannot consume scoped service from singleton" error
/// 4. The router remains stateless between messages
/// </remarks>
public class MessageRouter : IMessageRouter
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MessageRouter> _logger;

    public MessageRouter(IServiceProvider serviceProvider, ILogger<MessageRouter> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }
    
    public async Task RouteMessage(object socket, string clientId, string message)
    {
        try
        {
            var baseMessage = JsonSerializer.Deserialize<BaseDto>(message);

            if (baseMessage == null)
            {
                _logger.LogWarning("Received invalid message format from {ClientId}", clientId);
                return;
            }
            
            // Create a new scope for each message to properly manage scoped services
            // This ensures each handler gets its own properly scoped dependencies
            using var scope = _serviceProvider.CreateScope();

            // Route message based on eventType
            switch (baseMessage.eventType)
            {
                case EventTypes.DrawEvent:
                case EventTypes.ClearCanvas:
                    var drawHandler = scope.ServiceProvider.GetRequiredService<IDrawEventHandler>();
                    await drawHandler.HandleDrawEvent(clientId, message);
                    break;

                case EventTypes.ChatMessage:
                    var chatHandler = scope.ServiceProvider.GetRequiredService<IChatEventHandler>();
                    await chatHandler.HandleChatEvent(clientId, message);
                    break;

                case EventTypes.RoomJoin:
                    var roomJoinHandler = scope.ServiceProvider.GetRequiredService<IRoomEventHandler>();
                    await roomJoinHandler.HandleJoinRoomEvent(clientId, message);
                    break;

                case EventTypes.RoomLeave:
                    var roomLeaveHandler = scope.ServiceProvider.GetRequiredService<IRoomEventHandler>();
                    await roomLeaveHandler.HandleLeaveRoomEvent(clientId, message);
                    break;

                default:
                    _logger.LogWarning("Unhandled message type: {MessageType} from client {ClientId}",
                        baseMessage.eventType, clientId);
                    break;
            }
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Error deserializing message from {ClientId}: {Message}", clientId, message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing message from client {ClientId}: {Error}", clientId, ex.Message);
        }
    }
}