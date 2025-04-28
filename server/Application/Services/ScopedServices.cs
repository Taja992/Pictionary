using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Application.Services;


// This is just a helper class so all the scoped classes
// used during game process can be easily accessed
public class ScopedServices
{
    public IGameRepository GameRepository { get; }
    public IRoomRepository RoomRepository { get; }
    public IUserRepository UserRepository { get; }
    public IScoreRepository ScoreRepository { get; }
    public IWordService WordService { get; }
    public IGameNotificationService GameNotificationService { get; }

    public ScopedServices(IServiceScope scope)
    {
        GameRepository = scope.ServiceProvider.GetRequiredService<IGameRepository>();
        RoomRepository = scope.ServiceProvider.GetRequiredService<IRoomRepository>();
        UserRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        ScoreRepository = scope.ServiceProvider.GetRequiredService<IScoreRepository>();
        WordService = scope.ServiceProvider.GetRequiredService<IWordService>();
        GameNotificationService = scope.ServiceProvider.GetRequiredService<IGameNotificationService>();
    }
}