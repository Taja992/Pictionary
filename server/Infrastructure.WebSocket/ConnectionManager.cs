using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;
using Application.Interfaces.WebsocketInterfaces;

namespace Infrastructure.WebSocket;


public class ConnectionManager : IConnectionManager
{
    private readonly ILogger<ConnectionManager> _logger;
    private readonly ConcurrentDictionary<string, System.Net.WebSockets.WebSocket> _clientIdToSocket = new();
    private readonly ConcurrentDictionary<System.Net.WebSockets.WebSocket, string> _socketToClientId = new();
    private readonly ConcurrentDictionary<string, HashSet<string>> _topicToMembers = new();
    private readonly ConcurrentDictionary<string, HashSet<string>> _memberToTopics = new();
    
    public ConnectionManager(ILogger<ConnectionManager> logger)
    {
        _logger = logger;
    }

    public ConcurrentDictionary<string, object> GetConnectionIdToSocketDictionary()
    {
        // Convert to the expected return type
        var result = new ConcurrentDictionary<string, object>();
        foreach (var pair in _clientIdToSocket)
        {
            result.TryAdd(pair.Key, pair.Value);
        }
        return result;
    }

    public ConcurrentDictionary<string, string> GetSocketIdToClientIdDictionary()
    {
        var result = new ConcurrentDictionary<string, string>();
        foreach (var pair in _socketToClientId)
        {
            // Using the socket's hash code as an identifier
            result.TryAdd(pair.Key.GetHashCode().ToString(), pair.Value);
        }
        return result;
    }

    public Task OnOpen(object socket, string clientId)
    {
        if (socket is System.Net.WebSockets.WebSocket webSocket)
        {
            _clientIdToSocket.TryAdd(clientId, webSocket);
            _socketToClientId.TryAdd(webSocket, clientId);
            _logger.LogInformation("Client {ClientId} connected", clientId);
        }
        else
        {
            _logger.LogWarning("Attempted to connect non-WebSocket object for client {ClientId}", clientId);
        }
        
        return Task.CompletedTask;
    }

    public Task OnClose(object socket, string clientId)
    {
        if (string.IsNullOrEmpty(clientId) && socket is System.Net.WebSockets.WebSocket webSocket)
        {
            // Using TryGetValue with out parameter - safer approach
            _socketToClientId.TryGetValue(webSocket, out string? clientIdFromSocket);
            clientId = clientIdFromSocket ?? string.Empty;
        }

        if (!string.IsNullOrEmpty(clientId))
        {
            // Remove from client-to-socket mapping
            _clientIdToSocket.TryRemove(clientId, out _);
            
            // Remove client from all topics
            if (_memberToTopics.TryGetValue(clientId, out var topics))
            {
                foreach (var topic in topics)
                {
                    RemoveFromTopic(topic, clientId).GetAwaiter().GetResult();
                }
                _memberToTopics.TryRemove(clientId, out _);
            }

            _logger.LogInformation("Client {ClientId} disconnected", clientId);
        }

        if (socket is System.Net.WebSockets.WebSocket webSocketObj)
        {
            _socketToClientId.TryRemove(webSocketObj, out _);
        }

        return Task.CompletedTask;
    }

    public Task AddToTopic(string topic, string memberId)
    {
        if (string.IsNullOrEmpty(topic) || string.IsNullOrEmpty(memberId))
        {
            return Task.CompletedTask;
        }

        // Add member to topic
        _topicToMembers.AddOrUpdate(
            topic,
            _ => new HashSet<string> { memberId },
            (_, members) =>
            {
                members.Add(memberId);
                return members;
            });
        
        // Add topic to member's list
        _memberToTopics.AddOrUpdate(
            memberId,
            _ => new HashSet<string> { topic },
            (_, topics) =>
            {
                topics.Add(topic);
                return topics;
            });

        _logger.LogInformation("Client {ClientId} added to topic {Topic}", memberId, topic);
        return Task.CompletedTask;
    }

    public Task RemoveFromTopic(string topic, string memberId)
    {
        if (string.IsNullOrEmpty(topic) || string.IsNullOrEmpty(memberId))
        {
            return Task.CompletedTask;
        }

        // Remove member from topic
        if (_topicToMembers.TryGetValue(topic, out var members))
        {
            members.Remove(memberId);
            
            // Remove topic if empty
            if (members.Count == 0)
            {
                _topicToMembers.TryRemove(topic, out _);
            }
        }
        
        // Remove topic from member's list
        if (_memberToTopics.TryGetValue(memberId, out var topics))
        {
            topics.Remove(topic);
            
            // Remove member if no topics
            if (topics.Count == 0)
            {
                _memberToTopics.TryRemove(memberId, out _);
            }
        }

        _logger.LogInformation("Client {ClientId} removed from topic {Topic}", memberId, topic);
        return Task.CompletedTask;
    }

    public Task BroadcastToTopic<TMessage>(string topic, TMessage message) where TMessage : class
    {
        if (string.IsNullOrEmpty(topic))
        {
            _logger.LogWarning("Attempted to broadcast to empty topic");
            return Task.CompletedTask;
        }

        var members = GetMembersFromTopicId(topic).GetAwaiter().GetResult();
        var messageString = message as string ?? System.Text.Json.JsonSerializer.Serialize(message);
        
        foreach (var memberId in members)
        {
            var webSocket = GetSocketFromClientId(memberId) as System.Net.WebSockets.WebSocket;
            if (webSocket != null && webSocket.State == System.Net.WebSockets.WebSocketState.Open)
            {
                try
                {
                    var buffer = System.Text.Encoding.UTF8.GetBytes(messageString);
                    webSocket.SendAsync(
                        new ArraySegment<byte>(buffer, 0, buffer.Length),
                        System.Net.WebSockets.WebSocketMessageType.Text,
                        true,
                        CancellationToken.None).GetAwaiter().GetResult();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error broadcasting to client {ClientId}", memberId);
                }
            }
        }
        
        return Task.CompletedTask;
    }

    public Task<List<string>> GetMembersFromTopicId(string topic)
    {
        if (string.IsNullOrEmpty(topic) || !_topicToMembers.TryGetValue(topic, out var members))
        {
            return Task.FromResult(new List<string>());
        }
        
        return Task.FromResult(members.ToList());
    }

    public Task<List<string>> GetTopicsFromMemberId(string memberId)
    {
        if (string.IsNullOrEmpty(memberId) || !_memberToTopics.TryGetValue(memberId, out var topics))
        {
            return Task.FromResult(new List<string>());
        }
        
        return Task.FromResult(topics.ToList());
    }

    public string GetClientIdFromSocket(object socket)
    {
        if (socket is System.Net.WebSockets.WebSocket webSocket && _socketToClientId.TryGetValue(webSocket, out var clientId))
        {
            return clientId;
        }
        
        return string.Empty;
    }

    public object? GetSocketFromClientId(string clientId)
    {
        if (!string.IsNullOrEmpty(clientId) && _clientIdToSocket.TryGetValue(clientId, out var socket))
        {
            return socket;
        }
        
        return null;
    }

    
}