using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class ScoreService : IScoreService
{
    private readonly IScoreRepository _scoreRepository;
    private readonly INotificationService _notificationService;
    private readonly IGameRepository _gameRepository;
    private readonly ILogger<ScoreService> _logger;
    

    public ScoreService(IScoreRepository scoreRepository,
     INotificationService notificationService,
     IGameRepository gameRepository,
     ILogger<ScoreService> logger)
    {
        _scoreRepository = scoreRepository;
        _notificationService = notificationService;
        _gameRepository = gameRepository;
        _logger = logger;
    }
    
    public async Task CalculateGuessPointsAsync(Game game, string userId)
    {

        if (game == null)
        {
            throw new Exception("Game not found");
        }
        
        _logger.LogDebug("Calculating points for user {UserId} in game {GameId}, round {Round}, status {Status}", 
            userId, game.Id, game.CurrentRound, game.Status);

        // check if player has scored already in this round
        var existingScore = await _scoreRepository.GetScoreForRoundAsync(game.Id, userId, game.CurrentRound);
        if (existingScore != null)
        {
            // Player has already scored in this round, no points awarded
            _logger.LogInformation("User {UserId} already scored {Points} points in round {Round} of game {GameId}",
                userId, existingScore.Points, game.CurrentRound, game.Id);
            return;
        }

        if (game.Status != GameStatus.Drawing || !game.RoundStartTime.HasValue)
        {
            //await AwardPointsForCorrectGuessAsync(gameId, userId, 10);
            _logger.LogInformation("Cannot award points - game {GameId} not in Drawing state or missing round start time. Status: {Status}", 
                game.Id, game.Status);
            return;
        } 

        TimeSpan elapsedTime = DateTime.UtcNow - game.RoundStartTime.Value;

        int remainingSeconds = Math.Max(0, game.RoundTimeSeconds - (int)elapsedTime.TotalSeconds);

        int points = remainingSeconds * 10;

        // Ensure points are at least 10
        points = Math.Max(10, points);
        
        await AwardPointsForCorrectGuessAsync(game.Id, userId, points);
        
    }
    
    private async Task AwardPointsForCorrectGuessAsync(string gameId, string userId, int pointsGained)
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