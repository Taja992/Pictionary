using Api.Rest.DTOs.User;
using Application.Interfaces.Services;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Api.Rest.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UserController> _logger;
    private readonly IMapper _mapper;
    
    public UserController(IUserService userService, ILogger<UserController> logger, IMapper mapper)
    {
        _userService = userService;
        _logger = logger;
        _mapper = mapper;
    }
    
    [HttpPost("register-temp")]
    public async Task<ActionResult<UserDto>> RegisterTemporaryUser([FromBody] TempUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username))
        {
            return BadRequest("Username is required");
        }
        
        try
        {
            var user = await _userService.GetOrCreateTemporaryUserAsync(request.Username);
            
            var userDto = _mapper.Map<UserDto>(user);
            
            return Ok(userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering temporary user");
            return StatusCode(500, "An error occurred while registering the user");
        }
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null)
        {
            return NotFound();
        }
        
        var userDto = _mapper.Map<UserDto>(user);
        
        return Ok(userDto);
    }
}