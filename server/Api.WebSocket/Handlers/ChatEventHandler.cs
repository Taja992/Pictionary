using System.Text.Json;
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
    // private readonly IScoreService _scoreService;
    
    public ChatEventHandler(IConnectionManager connectionManager, ILogger<ChatEventHandler> logger, IGameOrchestrationService gameService
        )
    {
        _connectionManager = connectionManager;
        _logger = logger;
        _gameService = gameService;
        // _scoreService = scoreService;
    }

    public async Task HandleChatEvent(string clientId, string messageJson)
    {
        try
        {
            // Parse the message using the standalone DTO
            var chatMessage = JsonSerializer.Deserialize<ChatMessageDto>(messageJson);
            if (chatMessage == null) return;

            string roomId = chatMessage.RoomId;


            if (string.IsNullOrEmpty(roomId)) return;
            
            // Simply broadcast through the connection manager
            await _connectionManager.BroadcastToRoom(roomId, messageJson);

            if (!string.IsNullOrEmpty(chatMessage.Message?.Trim()))
            {
                var game = await _gameService.GetCurrentGameForRoomAsync(roomId);

                if (game != null)
                {
                    if (string.Equals(chatMessage.Message.Trim(), game.CurrentWord, StringComparison.OrdinalIgnoreCase))
                    {
                        // This is where my method goes to handle the correct guess
                        _logger.LogInformation($"Received chat message: {chatMessage.Message} the correct word is {game.CurrentWord}");
                        //await _scoreService.CalculateGuessPointsAsync(game.Id, clientId);
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