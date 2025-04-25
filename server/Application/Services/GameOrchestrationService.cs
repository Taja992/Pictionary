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
    private readonly IGameNotificationService _gameNotificationService;
    private readonly ILogger<GameOrchestrationService> _logger;

    private static readonly Dictionary<string, CancellationTokenSource> GameTimers = new();

    public GameOrchestrationService(
        IGameRepository gameRepository,
        IRoomRepository roomRepository,
        IUserRepository userRepository,
        IWordService wordService,
        IScoreRepository scoreRepository,
        IGameNotificationService gameNotificationService, 
        ILogger<GameOrchestrationService> logger)
    {
        _gameRepository = gameRepository;
        _roomRepository = roomRepository;
        _userRepository = userRepository;
        _wordService = wordService;
        _gameNotificationService = gameNotificationService;
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
        
        await _gameNotificationService.NotifyGameCreated(roomId, game);

        // Automatically start the game
        _ = StartGameAutomaticallyAsync(game.Id);

        return game;
    }

    private async Task StartGameAutomaticallyAsync(string gameId)
    {
        try
        {
            // Wait 2 seconds before starting the game to allow clients to initialize
            await Task.Delay(2000);
            
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null || game.Status == GameStatus.GameEnd)
            {
                _logger.LogWarning("Cannot start game {GameId} - game not found or already ended", gameId);
                return;
            }

            // Create a cancellation token source for this game
            var cts = new CancellationTokenSource();
            GameTimers[gameId] = cts;

            // Start the first round
            var gameStart = await StartRoundAsync(gameId);
            
            await _gameNotificationService.NotifyGameStarted(game.RoomId, gameStart);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting game {GameId} automatically", gameId);
        }
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

    private async Task<Game> StartRoundAsync(string gameId)
    {
        // Get and validate game
        var game = await GetAndIncrementRoundCounter(gameId);
    
        try
        {
            // Prepare the round (select drawer and word)
            await PrepareRoundAsync(game);
        
            // Start the round timer
            await StartRoundTimerAsync(gameId);
        
            // Get the final updated game state
            var updatedGame = await RefreshGameStateAsync(gameId) ?? game;
        
            // Send Notification
            await _gameNotificationService.NotifyRoundStarted(updatedGame.RoomId, updatedGame);
        
            // Send the word to the drawer only
            if (updatedGame.CurrentDrawerId != null && updatedGame.CurrentWord != null)
            {
                await _gameNotificationService.SendWordToDrawer(updatedGame.CurrentDrawerId, updatedGame.CurrentWord);
            }
        
            return updatedGame;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in round setup for game {GameId}", gameId);
            return game;
        }
    }
    
    private async Task<Game> GetAndIncrementRoundCounter(string gameId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game == null)
        {
            throw new Exception($"Game with ID {gameId} not found");
        }
    
        // Increment round number
        game.CurrentRound++;
        
        // Set round start time but keep status as "Starting" until word and drawer are set
        game.RoundStartTime = DateTime.UtcNow;
    
        await _gameRepository.UpdateAsync(game);
        
        _logger.LogInformation("Starting round {Round} in game {GameId}", game.CurrentRound, gameId);
        
        return game;
    }
    
    private async Task PrepareRoundAsync(Game game)
    {
        // Select drawer
        string drawerId = await SelectNextDrawerAsync(game.Id);
        
        // Select word
        string word = await SelectWordForRoundAsync(game.Id);
        
        // Now that we have both drawer and word, set game to Drawing state
        var updatedGame = await _gameRepository.GetByIdAsync(game.Id);
        if (updatedGame != null)
        {
            updatedGame.Status = GameStatus.Drawing;
            await _gameRepository.UpdateAsync(updatedGame);
        }
    }
    
    private async Task<Game?> RefreshGameStateAsync(string gameId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game == null)
        {
            _logger.LogWarning("Game {GameId} was not found after starting round", gameId);
        }
        return game;
    }

    private async Task StartRoundTimerAsync(string gameId)
    {
        try
        {
            if (!GameTimers.TryGetValue(gameId, out var cts))
            {
                cts = new CancellationTokenSource();
                GameTimers[gameId] = cts;
            }

            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
            {
                _logger.LogWarning("Cannot start round timer - game {GameId} not found", gameId);
                return;
            }

            // Start a timer for the round duration
            _ = Task.Run(async () =>
            {
                try
                {
                    // Wait for the round to complete
                    await Task.Delay(game.RoundTimeSeconds * 1000, cts.Token);
                    
                    // End the round if it hasn't been ended already
                    var currentGame = await _gameRepository.GetByIdAsync(gameId);
                    if (currentGame != null && currentGame.Status == GameStatus.Drawing)
                    {
                        await EndRoundAsync(gameId);
                    }
                }
                catch (TaskCanceledException)
                {
                    // Timer was cancelled, nothing to do
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in round timer for game {GameId}", gameId);
                }
            }, cts.Token);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting round timer for game {GameId}", gameId);
        }
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
        // send notification
        await _gameNotificationService.NotifyRoundEnded(game.RoomId, game);
        
        _logger.LogInformation("Ended round {Round} in game {GameId}", game.CurrentRound, gameId);

        // If this was the last round, end the game
        if (game.CurrentRound >= game.TotalRounds)
        {
            return await EndGameAsync(gameId);
        }
        else
        {
            // Start next round after delay
            _ = StartNextRoundAfterDelayAsync(gameId);
        }

        return game;
    }

    private async Task StartNextRoundAfterDelayAsync(string gameId)
    {
        try
        {
            // Wait 8 seconds before starting the next round
            await Task.Delay(8000);
            
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null || game.Status == GameStatus.GameEnd)
            {
                _logger.LogWarning("Cannot start next round - game {GameId} not found or already ended", gameId);
                return;
            }

            // Start the next round
            await StartRoundAsync(gameId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting next round for game {GameId}", gameId);
        }
    }

    private async Task<Game> EndGameAsync(string gameId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game == null)
        {
            throw new Exception($"Game with ID {gameId} not found");
        }

        // Cancel any active timers for this game
        if (GameTimers.TryGetValue(gameId, out var cts))
        {
            await cts.CancelAsync();
            GameTimers.Remove(gameId);
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
        await _gameNotificationService.NotifyGameEnded(game.RoomId, game);
        
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

    private async Task<string> SelectWordForRoundAsync(string gameId, string? category = null)
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

    private async Task<string> SelectNextDrawerAsync(string gameId)
    {
        try
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
            {
                _logger.LogWarning("Cannot select drawer for game {GameId} - game not found", gameId);
                return string.Empty;
            }
        
            var room = await _roomRepository.GetByIdAsync(game.RoomId);
            if (room == null || room.Players.Count == 0)
            {
                _logger.LogWarning("Cannot select drawer for game {GameId} - room {RoomId} not found or has no players", 
                    gameId, game.RoomId);
                return string.Empty;
            }

            // Find current drawer index
            var currentDrawerIndex = -1;
            if (game.CurrentDrawerId != null)
            {
                currentDrawerIndex = room.Players.FindIndex(p => p.Id == game.CurrentDrawerId);
            }

            // Select next drawer (circular)
            var nextDrawerIndex = (currentDrawerIndex + 1) % room.Players.Count;
            var nextDrawer = room.Players[nextDrawerIndex];

            // Assign the drawer
            await AssignDrawerAsync(gameId, nextDrawer.Id);
        
            // Notify
            await _gameNotificationService.NotifyDrawerSelected(game.RoomId, nextDrawer.Id, nextDrawer.Username);

            _logger.LogInformation("Selected {Username} as drawer for game {GameId}", nextDrawer.Username, gameId);
            return nextDrawer.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error selecting drawer for game {GameId}", gameId);
            return string.Empty;
        }
    }

    // private async Task<bool> ForceStopGameAsync(string gameId)
    // {
    //     try
    //     {
    //         // Cancel any active timers
    //         if (_gameTimers.TryGetValue(gameId, out var cts))
    //         {
    //             cts.Cancel();
    //             _gameTimers.Remove(gameId);
    //         }
            
    //         // End the game
    //         await EndGameAsync(gameId);
    //         return true;
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex, "Error force stopping game {GameId}", gameId);
    //         return false;
    //     }
    // }
}