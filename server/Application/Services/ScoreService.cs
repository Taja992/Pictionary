using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Core.Domain.Entities;

namespace Application.Services;

public class ScoreService : IScoreService
{
    private readonly IScoreRepository _scoreRepository;
    private readonly INotificationService _notificationService;
    private readonly IGameRepository _gameRepository;
    

    public ScoreService(IScoreRepository scoreRepository,
     INotificationService notificationService,
     IGameRepository gameRepository)
    {
        _scoreRepository = scoreRepository;
        _notificationService = notificationService;
        _gameRepository = gameRepository;
    }
    
    public async Task CalculateGuessPointsAsync(string gameId, string userId)
    {
        // get the game
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game == null)
        {
            throw new Exception("Game not found");
        }

        // check if player has scored already in this round
        var existingScore = await _scoreRepository.GetScoreForRoundAsync(gameId, userId, game.CurrentRound);
        if (existingScore != null)
        {
            // Player has already scored in this round, no points awarded
            return;
        }

        if (game.Status != GameStatus.Drawing || !game.RoundStartTime.HasValue)
        {
            //await AwardPointsForCorrectGuessAsync(gameId, userId, 10);
            return;
        } 

        TimeSpan elapsedTime = DateTime.UtcNow - game.RoundStartTime.Value;

        int remainingSeconds = Math.Max(0, game.RoundTimeSeconds - (int)elapsedTime.TotalSeconds);

        int points = remainingSeconds * 10;

        // Ensure points are at least 10
        points = Math.Max(10, points);
        
        await AwardPointsForCorrectGuessAsync(gameId, userId, points);
        
    }
    
    public async Task AwardPointsForCorrectGuessAsync(string gameId, string userId, int pointsGained)
    {
        var game = await _gameRepository.GetByIdAsync(gameId) ?? throw new Exception("Game not found");
        var roomId = game.RoomId;
        var score = new Score
        {   
            Id = Guid.NewGuid().ToString(),
            GameId = gameId,
            UserId = userId,
            Points = pointsGained,
            Round = game.CurrentRound,
            UpdatedAt = DateTime.UtcNow
        };
        
        await _scoreRepository.CreateAsync(score);

        var userScores = await _scoreRepository.GetScoresByGameAndUserAsync(gameId, userId);
        var totalPoints = userScores.Sum(s => s.Points);

        // If no previous scores exist, use the current points
        if (totalPoints == 0)
        {
            totalPoints = pointsGained;
        }
        await _notificationService.NotifyScoreUpdated(gameId, roomId, userId, pointsGained, totalPoints);
    }

}