using Core.Domain.Entities;

namespace Application.Interfaces.Services;

public interface INotificationService
{
    Task NotifyGameCreated(string roomId, Game game);
    Task NotifyGameStarted(string roomId, Game game);
    Task NotifyJoinedGame(string roomId, string userId, string username);
    Task NotifyRoundStarted(string roomId, Game game);
    Task NotifyRoundEnded(string roomId, Game game);
    Task NotifyGameEnded(string roomId, Game game);
    Task NotifyDrawerSelected(string roomId, string drawerId, string drawerName);
    Task SendWordToDrawer(string drawerId, string word);
    Task NotifyRoomCreated(Room room);
    Task NotifyRoomDeleted(string roomId);
}