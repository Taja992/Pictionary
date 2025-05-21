using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Core.Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class GameOrchestrationService : IGameOrchestrationService
{
    private readonly IGameRepository _gameRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IUserRepository _userRepository;
    private readonly IScoreRepository _scoreRepository;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly INotificationService _notificationService;
    private readonly ILogger<GameOrchestrationService> _logger;

    private static readonly Dictionary<string, CancellationTokenSource> GameTimers = new();

    public GameOrchestrationService(
        IGameRepository gameRepository,
        IRoomRepository roomRepository,
        IUserRepository userRepository,
        IScoreRepository scoreRepository,
        IServiceScopeFactory serviceScopeFactory,
        INotificationService notificationService, 
        ILogger<GameOrchestrationService> logger)
    {
        _gameRepository = gameRepository;
        _roomRepository = roomRepository;
        _userRepository = userRepository;
        _serviceScopeFactory = serviceScopeFactory;
        _notificationService = notificationService;
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
                UpdatedAt = DateTime.UtcNow
            };

            await _scoreRepository.CreateAsync(score);
        }

        await _notificationService.NotifyGameCreated(roomId, game);

        // Store the game ID for delayed processing
        _ = Task.Run(async () => 
        {
            try 
            {
                // Wait 2 seconds before starting the game to allow clients to initialize
                await Task.Delay(2000);

                // Use a scoped service provider to get fresh DbContext instances
                using var scope = _serviceScopeFactory.CreateScope();
                var gameRepository = scope.ServiceProvider.GetRequiredService<IGameRepository>();
                var gameNotificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                // Get a fresh game instance with a new DbContext
                var freshGameInstance = await gameRepository.GetByIdAsync(game.Id);
                if (freshGameInstance == null || freshGameInstance.Status == GameStatus.GameEnd)
                {
                    _logger.LogWarning("Cannot start game {GameId} - game not found or already ended", game.Id);
                    return;
                }

                // Create a cancellation token source for this game
                var cts = new CancellationTokenSource();
                GameTimers[game.Id] = cts;

                // Start the first round (using the StartRound method that takes a service scope)
                var gameStart = await StartRoundWithScopeAsync(game.Id, scope);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting game {GameId} automatically", game.Id);
            }
        });

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
        
        // _logger.LogInformation("Retrieved current game for room {RoomId}: {GameId}", 
        //     roomId, currentGame?.Id ?? "No active game");
        
        return currentGame;
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

    private async Task<Game> StartRoundWithScopeAsync(string gameId, IServiceScope scope)
    {
        // Get fresh repositories from the scope
        var services = new ScopedServices(scope);
        
        // Get and validate game
        var game = await GetAndIncrementRoundCounterWithScopeAsync(gameId, services.GameRepository);
        
        try
        {
            // If this is round 1, send game started notification
            // BEFORE sending round started notification
            if (game.CurrentRound == 1)
            {
                await services.NotificationService.NotifyGameStarted(game.RoomId, game);
            }
            // Prepare the round (select drawer and word)
            await PrepareRoundWithScopeAsync(game, scope);
            
            // Start the round timer
            await StartRoundTimerWithScopeAsync(gameId, scope);
            
            // Get the final updated game state
            var updatedGame = await services.GameRepository.GetByIdAsync(gameId) ?? game;
            
            // Send Notification
            await services.NotificationService.NotifyRoundStarted(updatedGame.RoomId, updatedGame);
            
            // Send the word to the drawer only
            if (updatedGame.CurrentDrawerId != null && updatedGame.CurrentWord != null)
            {
                await services.NotificationService.SendWordToDrawer(updatedGame.CurrentDrawerId, updatedGame.CurrentWord);
            }
            
            return updatedGame;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in round setup for game {GameId}", gameId);
            return game;
        }
    }

    private async Task<Game> GetAndIncrementRoundCounterWithScopeAsync(string gameId, IGameRepository gameRepository)
    {
        var game = await gameRepository.GetByIdAsync(gameId);
        if (game == null)
        {
            throw new Exception($"Game with ID {gameId} not found");
        }

        // Increment round number
        game.CurrentRound++;
        
        // Set round start time but keep status as "Starting" until word and drawer are set
        game.RoundStartTime = DateTime.UtcNow;

        await gameRepository.UpdateAsync(game);
        
        _logger.LogInformation("Starting round {Round} in game {GameId}", game.CurrentRound, gameId);
        
        return game;
    }

    private async Task PrepareRoundWithScopeAsync(Game game, IServiceScope scope)
    {
        var services = new ScopedServices(scope);
        
        // Select drawer
        await SelectNextDrawerWithScopeAsync(game.Id, services);
        
        // Select word
        await SelectWordForRoundWithScopeAsync(game.Id, null, services.GameRepository, services.WordService);
        
        // Now that we have both drawer and word, set game to Drawing state
        var updatedGame = await services.GameRepository.GetByIdAsync(game.Id);
        if (updatedGame != null)
        {
            updatedGame.Status = GameStatus.Drawing;
            await services.GameRepository.UpdateAsync(updatedGame);
        }
    }

    private async Task SelectNextDrawerWithScopeAsync(string gameId, ScopedServices services)
    {
        try
        {
            var game = await services.GameRepository.GetByIdAsync(gameId);
            if (game == null)
            {
                _logger.LogWarning("Cannot select drawer for game {GameId} - game not found", gameId);
                return;
            }
        
            var room = await services.RoomRepository.GetByIdAsync(game.RoomId);
            if (room == null || room.Players.Count == 0)
            {
                _logger.LogWarning("Cannot select drawer for game {GameId} - room {RoomId} not found or has no players", 
                    gameId, game.RoomId);
                return;
            }
    
            // Log all players for troubleshooting
            _logger.LogDebug("Selecting drawer from {PlayerCount} players: {Players}", 
                room.Players.Count,
                string.Join(", ", room.Players.Select(p => $"{p.Username} (Id: {p.Id})")));
    
            // Create a list of eligible drawers (all players except the current drawer)
            List<User> eligibleDrawers = [.. room.Players];
            
            // Remove the current drawer from eligible list if they exist
            if (game.CurrentDrawerId != null && eligibleDrawers.Count > 1)
            {
                var currentDrawer = eligibleDrawers.FirstOrDefault(p => p.Id == game.CurrentDrawerId);
                if (currentDrawer != null)
                {
                    _logger.LogDebug("Removing current drawer {Username} from eligible drawers", currentDrawer.Username);
                    eligibleDrawers.Remove(currentDrawer);
                }
            }
            
            // Randomly select from the eligible drawers
            var random = new Random();
            var randomIndex = random.Next(eligibleDrawers.Count);
            var nextDrawer = eligibleDrawers[randomIndex];
            
            // Assign the drawer
            game.CurrentDrawerId = nextDrawer.Id;
            await services.GameRepository.UpdateAsync(game);
        
            // Notify
            await services.NotificationService.NotifyDrawerSelected(game.RoomId, nextDrawer.Id, nextDrawer.Username);
    
            _logger.LogInformation("Randomly selected {Username} as drawer for game {GameId}", nextDrawer.Username, gameId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error selecting drawer for game {GameId}", gameId);
        }
    }

    // category is always null because not implemented yet
    private async Task SelectWordForRoundWithScopeAsync(string gameId, string? category, IGameRepository gameRepository, IWordService wordService)
    {


        var game = await gameRepository.GetByIdAsync(gameId);
        if (game == null)
        {
            throw new Exception($"Game with ID {gameId} not found");
        }

        // Get random word
        string word = category != null 
            ? wordService.GetRandomWordByCategory(category)
            : wordService.GetRandomWord();

        // Set the current word
        game.CurrentWord = word;
        await gameRepository.UpdateAsync(game);
        
        _logger.LogInformation("Selected word '{Word}' for game {GameId}", word, gameId);
        
    }

    private async Task StartRoundTimerWithScopeAsync(string gameId, IServiceScope scope)
    {
        try
        {
            var services = new ScopedServices(scope);
        
            if (!GameTimers.TryGetValue(gameId, out var cts))
            {
                cts = new CancellationTokenSource();
                GameTimers[gameId] = cts;
            }

            var game = await services.GameRepository.GetByIdAsync(gameId);
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
                    // Importantly, create a NEW scope since this is a separate Task
                    using var roundEndScope = _serviceScopeFactory.CreateScope();
                    var scopedGameRepository = roundEndScope.ServiceProvider.GetRequiredService<IGameRepository>();
                    
                    var currentGame = await scopedGameRepository.GetByIdAsync(gameId);
                    if (currentGame != null && currentGame.Status == GameStatus.Drawing)
                    {
                        await EndRoundWithScopeAsync(gameId, roundEndScope);
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

    private async Task EndRoundWithScopeAsync(string gameId, IServiceScope scope)
    {
        var services = new ScopedServices(scope);

        var game = await services.GameRepository.GetByIdAsync(gameId);
        if (game == null)
        {
            throw new Exception($"Game with ID {gameId} not found");
        }

        // Set game state to round end
        game.Status = GameStatus.RoundEnd;

        // Clear current word and drawer
        game.CurrentWord = null;
        game.CurrentDrawerId = null;

        await services.GameRepository.UpdateAsync(game);

        // Send notification
        await services.NotificationService.NotifyRoundEnded(game.RoomId, game);

        _logger.LogInformation("Ended round {Round} in game {GameId}", game.CurrentRound, gameId);

        // If this was the last round, end the game
        if (game.CurrentRound >= game.TotalRounds)
        {
            // Start next round after delay
            // _ = StartNextRoundAfterDelayWithScopeAsync(gameId);
            _logger.LogInformation("Last round completed for game {GameId}. Game should end.", gameId);
            await EndGameWithScopeAsync(gameId, scope);
        }
        else
        {
            _logger.LogInformation("Starting next round for game {GameId}", gameId);
            _ = StartNextRoundAfterDelayWithScopeAsync(gameId);
        }
    }

    private async Task StartNextRoundAfterDelayWithScopeAsync(string gameId)
    {
        try
        {
            // Wait 8 seconds before starting the next round
            await Task.Delay(8000);
            
            // Create a new scope for the delayed operation
            using var scope = _serviceScopeFactory.CreateScope();
            var services = new ScopedServices(scope);
            
            var game = await services.GameRepository.GetByIdAsync(gameId);
            if (game == null || game.Status == GameStatus.GameEnd)
            {
                _logger.LogWarning("Cannot start next round - game {GameId} not found or already ended", gameId);
                return;
            }

            // Start the next round
            await StartRoundWithScopeAsync(gameId, scope);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting next round for game {GameId}", gameId);
        }
    }

    private async Task EndGameWithScopeAsync(string gameId, IServiceScope scope)
    {
        var services = new ScopedServices(scope);
        
        var game = await services.GameRepository.GetByIdAsync(gameId);
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
        var room = await services.RoomRepository.GetByIdAsync(game.RoomId);
        if (room != null)
        {
            room.Status = RoomStatus.Waiting;
            await services.RoomRepository.UpdateAsync(room);
        }
    
        await services.GameRepository.UpdateAsync(game);
        await services.NotificationService.NotifyGameEnded(game.RoomId, game);
        
        _logger.LogInformation("Ended game {GameId}", gameId);
    
        // Update player statistics in a new task (to avoid blocking)
        _ = Task.Run(async () =>
        {
            try 
            {
                // Create a new scope for this background task
                using var statsScope = _serviceScopeFactory.CreateScope();
                var statsUserRepo = statsScope.ServiceProvider.GetRequiredService<IUserRepository>();
                var statsScoreRepo = statsScope.ServiceProvider.GetRequiredService<IScoreRepository>();
                
                var scores = await statsScoreRepo.GetByGameIdAsync(gameId);
                
                foreach (var score in scores)
                {
                    var user = await statsUserRepo.GetByIdAsync(score.UserId);
                    if (user != null)
                    {
                        user.TotalGamesPlayed++;
                        
                        // Find the highest score
                        var highestScore = scores.OrderByDescending(s => s.Points).First();
                        if (score.UserId == highestScore.UserId)
                        {
                            user.TotalGamesWon++;
                        }
                        
                        await statsUserRepo.UpdateAsync(user);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating player stats for game {GameId}", gameId);
            }
        });
    }
    
}