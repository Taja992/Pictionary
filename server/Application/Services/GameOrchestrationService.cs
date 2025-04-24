using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class GameOrchestrationService : IGameOrchestrationService
{
    private readonly IGameRepository _gameRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IUserRepository _userRepository;
    private readonly IWordService _wordService;
    private readonly IScoreRepository _scoreRepository;
    private readonly ILogger<GameOrchestrationService> _logger;

    public GameOrchestrationService(
        IGameRepository gameRepository,
        IRoomRepository roomRepository,
        IUserRepository userRepository,
        IWordService wordService,
        IScoreRepository scoreRepository,
        ILogger<GameOrchestrationService> logger)
    {
        _gameRepository = gameRepository;
        _roomRepository = roomRepository;
        _userRepository = userRepository;
        _wordService = wordService;
        _scoreRepository = scoreRepository;
        _logger = logger;
    }

    public async Task<Game> CreateGameAsync(string roomId, int rounds, int timePerRound)
    {
        var room = await _roomRepository.GetByIdAsync(roomId);
        if (room == null)
        {
            throw new Exception($"Room with ID {roomId} not found");
        }

        // Create a new game
        var game = new Game
        {
            Id = Guid.NewGuid().ToString(),
            RoomId = roomId,
            StartTime = DateTime.UtcNow,
            Status = GameStatus.Starting,
            CurrentRound = 0,
            TotalRounds = rounds,
            RoundTimeSeconds = timePerRound
        };

        // Save the game
        await _gameRepository.CreateAsync(game);
        
        // Update room status
        room.Status = RoomStatus.Playing;
        await _roomRepository.UpdateAsync(room);

        _logger.LogInformation("Created new game {GameId} in room {RoomId}", game.Id, roomId);

        // Initialize scores for all players in the room
        foreach (var player in room.Players)
        {
            var score = new Score
            {
                Id = Guid.NewGuid().ToString(),
                GameId = game.Id,
                UserId = player.Id,
                Points = 0,
                DrawingPoints = 0,
                GuessingPoints = 0,
                RoundNumber = 0,
                UpdatedAt = DateTime.UtcNow
            };

            await _scoreRepository.CreateAsync(score);
        }

        return game;
    }

    public async Task<Game?> GetCurrentGameForRoomAsync(string roomId)
{
    var room = await _roomRepository.GetByIdAsync(roomId);
    if (room == null)
    {
        throw new Exception($"Room with ID {roomId} not found");
    }

    // Get the current game for the room from the repository
    var currentGame = await _gameRepository.GetCurrentGameForRoomAsync(roomId);
    
    _logger.LogInformation("Retrieved current game for room {RoomId}: {GameId}", 
        roomId, currentGame?.Id ?? "No active game");
    
    return currentGame;
}

    public async Task<Game> StartGameAsync(string gameId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game == null)
        {
            throw new Exception($"Game with ID {gameId} not found");
        }

        // Update game status
        game.Status = GameStatus.Starting;
        await _gameRepository.UpdateAsync(game);
        
        _logger.LogInformation("Started game {GameId}", gameId);

        // Start the first round
        return await StartRoundAsync(gameId);
    }

    public async Task<Game> StartRoundAsync(string gameId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game == null)
        {
            throw new Exception($"Game with ID {gameId} not found");
        }

        // Increment round number
        game.CurrentRound++;
        
        // Set game state to drawing
        game.Status = GameStatus.Drawing;
        
        // Set round start time
        game.RoundStartTime = DateTime.UtcNow;

        await _gameRepository.UpdateAsync(game);
        
        _logger.LogInformation("Started round {Round} in game {GameId}", game.CurrentRound, gameId);

        return game;
    }

    public async Task<Game> EndRoundAsync(string gameId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game == null)
        {
            throw new Exception($"Game with ID {gameId} not found");
        }

        // Set game state to round end
        game.Status = GameStatus.RoundEnd;
        
        // Clear current word and drawer
        game.CurrentWord = null;
        game.CurrentDrawerId = null;

        await _gameRepository.UpdateAsync(game);
        
        _logger.LogInformation("Ended round {Round} in game {GameId}", game.CurrentRound, gameId);

        // If this was the last round, end the game
        if (game.CurrentRound >= game.TotalRounds)
        {
            return await EndGameAsync(gameId);
        }

        return game;
    }

    public async Task<Game> EndGameAsync(string gameId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game == null)
        {
            throw new Exception($"Game with ID {gameId} not found");
        }

        // Set game state to finished
        game.Status = GameStatus.GameEnd;
        game.EndTime = DateTime.UtcNow;

        // Update room status
        var room = await _roomRepository.GetByIdAsync(game.RoomId);
        if (room != null)
        {
            room.Status = RoomStatus.Waiting;
            await _roomRepository.UpdateAsync(room);
        }

        await _gameRepository.UpdateAsync(game);
        
        _logger.LogInformation("Ended game {GameId}", gameId);

        // Update player statistics
        await UpdatePlayerStatsAsync(gameId);

        return game;
    }

    public async Task<bool> AssignDrawerAsync(string gameId, string userId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game == null)
        {
            throw new Exception($"Game with ID {gameId} not found");
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new Exception($"User with ID {userId} not found");
        }

        // Set the user as the current drawer
        game.CurrentDrawerId = userId;
        await _gameRepository.UpdateAsync(game);
        
        _logger.LogInformation("Assigned user {UserId} as drawer for game {GameId}", userId, gameId);

        return true;
    }

    public async Task<string> SelectWordForRoundAsync(string gameId, string? category = null)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game == null)
        {
            throw new Exception($"Game with ID {gameId} not found");
        }

        // Get random word
        string word = category != null 
            ? _wordService.GetRandomWordByCategory(category)
            : _wordService.GetRandomWord();

        // Set the current word
        game.CurrentWord = word;
        await _gameRepository.UpdateAsync(game);
        
        _logger.LogInformation("Selected word '{Word}' for game {GameId}", word, gameId);

        return word;
    }

    private async Task UpdatePlayerStatsAsync(string gameId)
    {
        var scores = await _scoreRepository.GetByGameIdAsync(gameId);
        
        foreach (var score in scores)
        {
            var user = await _userRepository.GetByIdAsync(score.UserId);
            if (user != null)
            {
                user.TotalGamesPlayed++;
                
                // Find the highest score
                var highestScore = scores.OrderByDescending(s => s.Points).First();
                if (score.UserId == highestScore.UserId)
                {
                    user.TotalGamesWon++;
                }
                
                await _userRepository.UpdateAsync(user);
            }
        }
    }
        public async Task<bool> AddPlayerToGameAsync(string gameId, string userId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game == null)
        {
            _logger.LogWarning("Cannot add player {UserId} to game {GameId} - game not found", userId, gameId);
            return false;
        }
    
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("Cannot add player {UserId} to game {GameId} - user not found", userId, gameId);
            return false;
        }
        
        _logger.LogInformation("Added player {UserId} to game {GameId}", userId, gameId);
        return true;
    }
}