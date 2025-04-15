namespace Api.Rest.DTOs.Game;

public class CreateGameRequest
{
    public string RoomId { get; set; } = null!;
    public int Rounds { get; set; } = 3;
    public int TimePerRound { get; set; } = 60;
}

public class AssignDrawerRequest
{
    public string UserId { get; set; } = null!;
}