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

    [HttpPut("{gameId}/rounds/end")]
    public async Task<ActionResult<GameDto>> EndRound(string gameId)
    {
        try
        {
            var game = await _gameService.EndRoundAsync(gameId);
            return Ok(_mapper.Map<GameDto>(game));
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{gameId}/drawer")]
    public async Task<ActionResult> AssignDrawer(string gameId, [FromBody] AssignDrawerRequest request)
    {
        try
        {
            var result = await _gameService.AssignDrawerAsync(gameId, request.UserId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{gameId}/word")]
    public async Task<ActionResult<WordDto>> SelectWord(string gameId, [FromQuery] string? category = null)
    {
        try
        {
            var word = await _gameService.SelectWordForRoundAsync(gameId, category);
            return Ok(_mapper.Map<WordDto>(word));
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