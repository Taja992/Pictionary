using Api.Rest.DTOs.Room;
using Application.Interfaces.Services;
using Application.Models.Results;
using Core.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Api.Rest.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomController : ControllerBase
{
    private readonly IRoomService _roomService;
    private readonly IUserService _userService;
    private readonly ILogger<RoomController> _logger;
    
    public RoomController(
        IRoomService roomService,
        IUserService userService, 
        ILogger<RoomController> logger)
    {
        _roomService = roomService;
        _userService = userService;
        _logger = logger;
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetRooms()
    {
        try
        {
            var rooms = await _roomService.GetAvailableRoomsAsync();
            var roomDtos = rooms.Select(MapToDto).ToList();
            return Ok(roomDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting available rooms");
            return StatusCode(500, "An error occurred while getting available rooms");
        }
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<RoomDto>> GetRoom(string id)
    {
        try
        {
            var room = await _roomService.GetRoomAsync(id);
            if (room == null)
            {
                return NotFound();
            }
            
            return Ok(MapToDto(room));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting room {RoomId}", id);
            return StatusCode(500, "An error occurred while getting the room");
        }
    }
    
    [HttpPost]
    public async Task<ActionResult<RoomDto>> CreateRoom([FromBody] CreateRoomRequest request)
    {
        try
        {
            // Create or get the temporary user
            var user = await _userService.GetOrCreateTemporaryUserAsync(request.Username);

            var room = await _roomService.CreateRoomAsync(
                request.Name,
                user.Id, // Assuming the user is the owner
                request.IsPrivate,
                request.Password
            );

            return CreatedAtAction(nameof(GetRoom), new { id = room.Id }, MapToDto(room));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating room");
            return StatusCode(500, "An error occurred while creating the room");
        }
    }
    
    [HttpPost("{id}/join")]
    public async Task<ActionResult> JoinRoom(string id, [FromBody] JoinRoomRequest request)
    {
        try
        {
            var result = await _roomService.JoinRoomAsync(
                id, 
                request.UserId, 
                request.Password, 
                request.JoinGame);
            
            return result switch
            {
                JoinRoomResult.Success => Ok(),
                JoinRoomResult.NotFound => NotFound("Room not found"),
                JoinRoomResult.IncorrectPassword => BadRequest("Incorrect password"),
                JoinRoomResult.RoomFull => BadRequest("Room is full"),
                JoinRoomResult.AlreadyJoined => BadRequest("Already joined this room"),
                _ => StatusCode(500, "Unknown error")
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error joining room {RoomId}", id);
            return StatusCode(500, "An error occurred while joining the room");
        }
    }
    
    [HttpPost("{id}/leave")]
    public async Task<ActionResult> LeaveRoom(string id, [FromQuery] string userId)
    {
        try
        {
            var success = await _roomService.LeaveRoomAsync(id, userId);
            if (!success)
            {
                return NotFound();
            }
            
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error leaving room {RoomId}", id);
            return StatusCode(500, "An error occurred while leaving the room");
        }
    }
    

    private static RoomDto MapToDto(Room room)
    {
        return new RoomDto
        {
            Id = room.Id,
            Name = room.Name,
            OwnerId = room.OwnerId,
            OwnerName = room.Owner?.Username ?? "Unknown",
            PlayerCount = room.Players?.Count ?? 0,
            MaxPlayers = room.MaxPlayers,
            IsPrivate = room.IsPrivate,
            Status = room.Status.ToString(),
            Players = room.Players?.Select(p => new PlayerDto
            {
                Id = p.Id,
                Name = p.Username,
                IsOnline = true // Assuming all players in the room are online
            }).ToList() ?? new List<PlayerDto>(),
            CurrentGameId = room.CurrentGame?.Id,
            CreatedAt = room.CreatedAt
        };
    }
}