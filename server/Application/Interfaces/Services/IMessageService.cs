namespace Application.Interfaces.Services;


public interface IMessageService
{
    Task SendToClient(string clientId, string message);
    Task SendToClient<TMessage>(string clientId, TMessage message) where TMessage : class;
    Task BroadcastToRoom(string room, string message);
    Task BroadcastToRoom<TMessage>(string room, TMessage message) where TMessage : class;
}

public interface IMessageRouter
{
    Task RouteMessage(object socket, string clientId, string message);
}