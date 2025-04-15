using Api.Rest.DTOs.Game;
using Application.Interfaces.Services;
using AutoMapper;
using Core.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Api.Rest.Controllers;

[ApiController]
[Route("api/games")]
[Authorize]
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

    [HttpPut("{gameId}/start")]
    public async Task<ActionResult<GameDto>> StartGame(string gameId)
    {
        try
        {
            var game = await _gameService.StartGameAsync(gameId);
            return Ok(_mapper.Map<GameDto>(game));
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{gameId}/rounds/start")]
    public async Task<ActionResult<GameDto>> StartRound(string gameId)
    {
        try
        {
            var game = await _gameService.StartRoundAsync(gameId);
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

    [HttpPut("{gameId}/end")]
    public async Task<ActionResult<GameDto>> EndGame(string gameId)
    {
        try
        {
            var game = await _gameService.EndGameAsync(gameId);
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
}