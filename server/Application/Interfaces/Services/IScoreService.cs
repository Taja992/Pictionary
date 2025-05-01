namespace Application.Interfaces.Services;

public interface IScoreService
{
    
    Task CalculateGuessPointsAsync(string gameId, string userId);
    Task AwardPointsForCorrectGuessAsync(string gameId, string userId, int points);
}