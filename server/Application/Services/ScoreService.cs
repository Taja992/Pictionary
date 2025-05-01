using Application.Interfaces.Repositories;
using Application.Interfaces.Services;

namespace Application.Services;

public class ScoreService : IScoreService
{
    private readonly IScoreRepository _scoreRepository;
    private readonly INotificationService _notificationService;
    

    public ScoreService(IScoreRepository scoreRepository, INotificationService notificationService)
    {
        IScoreService _scoreService;
        INotificationService _notificationService;
    }
    
    public Task CalculateGuessPointsAsync(string gameId, string userId)
    {
        throw new NotImplementedException();
        AwardPointsForCorrectGuessAsync(gameId, userId);
        
    }
    
    public Task AwardPointsForCorrectGuessAsync(string gameId, string userId)
    {
        throw new NotImplementedException();
        _notificationService.NotifyScoreUpdated(gameId, userId);
    }
}