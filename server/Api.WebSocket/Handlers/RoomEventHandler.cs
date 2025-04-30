using System.Text.Json;
using Application.Interfaces.Services;
using Application.Interfaces.WebsocketInterfaces;
using Application.Models.Results;
using Infrastructure.WebSocket.DTOs.Client;

namespace Api.WebSocket.Handlers;

public class RoomEventHandler : IRoomEventHandler 
{
    private readonly IConnectionManager _connectionManager;
    private readonly IRoomService _roomService;
    
    public RoomEventHandler(IConnectionManager connectionManager, IRoomService roomService)
    {
        _connectionManager = connectionManager;
        _roomService = roomService;
    }

    public async Task HandleJoinRoomEvent(string clientId, string messageJson)
    {
        try{
            var joinRequest = JsonSerializer.Deserialize<RoomJoinDto>(messageJson);
            if (joinRequest == null) return;

            var result = await _roomService.JoinRoomAsync(
                joinRequest.RoomId,
                joinRequest.UserId
            );

            if (result == JoinRoomResult.Success || result == JoinRoomResult.AlreadyJoined)
            {
                // Add client connection to room in connection manager
                await _connectionManager.AddToRoom(joinRequest.RoomId, clientId);

                // create update message to broadcast to room
                var updateMessage = new RoomUpdateDto
                {
                    RoomId = joinRequest.RoomId,
                    UserId = joinRequest.UserId,
                    Username = joinRequest.Username,
                    Action = RoomAction.Joined
                };

                await _connectionManager.BroadcastToRoom(joinRequest.RoomId, updateMessage);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error handling join room event: {ex.Message}");
        }
    }

    public async Task HandleLeaveRoomEvent(string clientId, string messageJson)
    {
        try
        {
            var leaveRequest = JsonSerializer.Deserialize<RoomLeaveDto>(messageJson);
            if (leaveRequest == null) return;

            var success = await _roomService.LeaveRoomAsync(
                leaveRequest.RoomId,
                leaveRequest.UserId
            );

            if (success)
            {
                await _connectionManager.RemoveFromRoom(leaveRequest.RoomId, clientId);

                var updateMessage = new RoomUpdateDto
                {
                    RoomId = leaveRequest.RoomId,
                    UserId = leaveRequest.UserId,
                    Username = leaveRequest.Username,
                    Action = RoomAction.Left
                };

                await _connectionManager.BroadcastToRoom(leaveRequest.RoomId, updateMessage);
            }
        } 
            catch (Exception ex)
        {
            Console.WriteLine($"Error handling leave room event: {ex.Message}");
        }
    }
}
