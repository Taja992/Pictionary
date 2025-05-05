using System.Text.Json;
using System.Text.RegularExpressions;
using Application.Interfaces.Services;
using Application.Interfaces.WebsocketInterfaces;
using Infrastructure.WebSocket.DTOs.Client;
using Microsoft.Extensions.Logging;

namespace Api.WebSocket.Handlers;

public class ChatEventHandler : IChatEventHandler 
{
    private readonly IConnectionManager _connectionManager;
    private readonly ILogger<ChatEventHandler> _logger;
    private readonly IGameOrchestrationService _gameService;
    private readonly IScoreService _scoreService;
    
    public ChatEventHandler(IConnectionManager connectionManager,
        ILogger<ChatEventHandler> logger,
        IGameOrchestrationService gameService,
        IScoreService scoreService
        )
    {
        _connectionManager = connectionManager;
        _logger = logger;
        _gameService = gameService;
        _scoreService = scoreService;
    }

    public async Task HandleChatEvent(string clientId, string messageJson)
    {
        try
        {
            // Parse the message using the standalone DTO
            var chatMessage = JsonSerializer.Deserialize<ChatMessageDto>(messageJson);
            if (chatMessage == null) return;
            
            
            string roomId = chatMessage.RoomId;
            var game = await _gameService.GetCurrentGameForRoomAsync(roomId);


            if (string.IsNullOrEmpty(roomId)) return;
            
            // Used regex magic to check if the message contains the current word
            // $@ - A string interpolation marker with verbatim string syntax
            //  \b - A word boundary anchor - matches the position between a word character and a non-word character
            // {Regex.Escape(game.CurrentWord)} - The game's current word, but with any special regex characters escaped
            // \b - Another word boundary anchor on the other side
            if (game != null && game.CurrentWord != null && !System.Text.RegularExpressions.Regex.IsMatch(chatMessage.Message, 
                $@"\b{Regex.Escape(game.CurrentWord)}\b", 
                System.Text.RegularExpressions.RegexOptions.IgnoreCase))
            {
                _logger.LogInformation($"Received chat message: {chatMessage.Message} the correct word is {game.CurrentWord} - not correct, sending to all clients in room {roomId}");
                await _connectionManager.BroadcastToRoom(roomId, messageJson);
            }

            if (!string.IsNullOrEmpty(chatMessage.Message.Trim()))
            {
                

                if (game != null)
                {
                    _logger.LogInformation("Received chat '{Message}' for game {GameId} also the current word is {CurrentWord}", 
                    chatMessage.Message, 
                    game.Id, game.CurrentWord);
                    if (string.Equals(chatMessage.Message.Trim(), game.CurrentWord, StringComparison.OrdinalIgnoreCase))
                    {
                        // This is where my method goes to handle the correct guess
                        _logger.LogInformation($"Received chat message: {chatMessage.Message} the correct word is {game.CurrentWord}");

                        string userId = await _connectionManager.GetUserIdFromClientId(clientId);
                        if (!string.IsNullOrEmpty(userId) &&  game.CurrentDrawerId != userId)
                        {
                            await _scoreService.CalculateGuessPointsAsync(game, userId);
                        }
                        else
                        {
                            _logger.LogWarning("Cannot award points: No user ID found for client {ClientId}, or they are the drawer", clientId);
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error handling chat message: {ex.Message}");
        }
    }
}