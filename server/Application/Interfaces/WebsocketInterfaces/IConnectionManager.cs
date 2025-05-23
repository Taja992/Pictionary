using System.Collections.Concurrent;

namespace Application.Interfaces.WebsocketInterfaces;

public interface IConnectionManager


{

    Task OnOpen(object socket, string clientId, string userId = "", string username = "");
    Task OnClose(object socket, string clientId);
    Task<List<string>> GetClientIdsForUser(string userId);
    Task AddToRoom(string room, string clientId);
    Task RemoveFromRoom(string room, string clientId);
    Task<List<string>> GetClientsFromRoomId(string room);
    Task<List<string>> GetRoomsFromClientId(string clientId);
    public object? GetSocketFromClientId(string clientId);
    Task<string> GetUserIdFromClientId(string clientId);
    void UpdateClientActivity(string clientId);
    Task CleanupStaleConnections();

}