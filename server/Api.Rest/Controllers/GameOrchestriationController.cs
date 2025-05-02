using Api.Rest.DTOs.Game;
using Application.Interfaces.Services;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;


namespace Api.Rest.Controllers;

[ApiController]
[Route("api/games")]
// [Authorize]
public class GameOrchestrationController(
    IGameOrchestrationService gameService,
    IMapper mapper) : ControllerBase
{
    private readonly IGameOrchestrationService _gameService = gameService;
    private readonly IMapper _mapper = mapper;

    [HttpPost]
    public async Task<ActionResult<GameDto>> CreateGame([FromBody] CreateGameRequest request)
    {
        try
        {
            var game = await _gameService.CreateGameAsync(
                request.RoomId, 
                request.Rounds, 
                request.TimePerRound);
            
            return Ok(_mapper.Map<GameDto>(game));
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("room/{roomId}")]
    public async Task<ActionResult<GameDto>> GetCurrentGameForRoom(string roomId)
    {
        try
        {
            var game = await _gameService.GetCurrentGameForRoomAsync(roomId);
            if (game == null)
            {
                return NotFound("No active game found for this room");
            }

            return Ok(_mapper.Map<GameDto>(game));
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

}