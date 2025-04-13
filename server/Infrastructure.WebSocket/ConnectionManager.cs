using System.Collections.Concurrent;
using Application.Interfaces.Infrastructure.Websocket;

namespace Infrastructure.WebSocket;

public class ConnectionManager : IConnectionManager
{
    private readonly ConcurrentDictionary<string, object> _connections = new();
    
    public ConcurrentDictionary<string, object> GetConnectionIdToSocketDictionary()
    {
        return _connections;
    }

    public ConcurrentDictionary<string, string> GetSocketIdToClientIdDictionary()
    {
        return new ConcurrentDictionary<string, string>();
    }

    public Task OnOpen(object socket, string clientId)
    {
        return Task.CompletedTask;
    }

    public Task OnClose(object socket, string clientId)
    {
        return Task.CompletedTask;
    }

    public Task AddToTopic(string topic, string memberId)
    {
        return Task.CompletedTask;
    }

    public Task RemoveFromTopic(string topic, string memberId)
    {
        return Task.CompletedTask;
    }

    public Task BroadcastToTopic<TMessage>(string topic, TMessage message) where TMessage : class
    {
        return Task.CompletedTask;
    }

    public Task<List<string>> GetMembersFromTopicId(string topic)
    {
        return Task.FromResult(new List<string>());
    }

    public Task<List<string>> GetTopicsFromMemberId(string memberId)
    {
        return Task.FromResult(new List<string>());
    }

    public string GetClientIdFromSocket(object socket)
    {
        return string.Empty;
    }

    public object GetSocketFromClientId(string clientId)
    {
        return null;
    }
}