using System.Collections.Concurrent;

namespace Application.Interfaces.WebsocketInterfaces;

public interface IConnectionManager
{
    public ConcurrentDictionary<string, object> GetConnectionIdToSocketDictionary();
    public ConcurrentDictionary<string, string> GetSocketIdToClientIdDictionary();

    Task OnOpen(object socket, string clientId, string userId = "", string username = "");
    Task OnClose(object socket, string clientId);
    Task<List<string>> GetClientIdsForUser(string userId);
    bool IsUserConnected(string userId);
    Task AddToRoom(string room, string clientId);
    Task RemoveFromRoom(string room, string clientId);
    Task BroadcastToRoom<TMessage>(string room, TMessage message) where TMessage : class;
    Task<List<string>> GetClientsFromRoomId(string room);
    Task<List<string>> GetRoomsFromClientId(string clientId);
    public string GetClientIdFromSocket(object socket);
    public object? GetSocketFromClientId(string clientId);
    Task SendToClient(string clientId, string message);
}