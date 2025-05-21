using Api.Rest.DTOs.Game;
using Application.Interfaces.Services;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;


namespace Api.Rest.Controllers;

[ApiController]
[Route("api/games")]

public class GameOrchestrationController(
    IGameOrchestrationService gameService,
    IMapper mapper) : ControllerBase
{


    [HttpPost]
    public async Task<ActionResult<GameDto>> CreateGame([FromBody] CreateGameRequest request)
    {
        try
        {
            var game = await gameService.CreateGameAsync(
                request.RoomId, 
                request.Rounds, 
                request.TimePerRound);
            
            return Ok(mapper.Map<GameDto>(game));
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
            var game = await gameService.GetCurrentGameForRoomAsync(roomId);
            if (game == null)
            {
                return NotFound("No active game found for this room");
            }

            return Ok(mapper.Map<GameDto>(game));
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

}