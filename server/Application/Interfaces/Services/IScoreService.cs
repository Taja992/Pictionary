using Core.Domain.Entities;

namespace Application.Interfaces.Services;

public interface IScoreService
{
    
    Task CalculateGuessPointsAsync(Game game, string userId);
    //Task AwardPointsForCorrectGuessAsync(string gameId, string userId, int points);
}