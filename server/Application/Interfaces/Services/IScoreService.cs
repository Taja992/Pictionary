namespace Application.Interfaces.Services;

public interface IScoreService
{
    Task AwardPointsForCorrectGuessAsync(string gameId, string userId);
    Task CalculateGuessPointsAsync(string gameId, string userId);
}