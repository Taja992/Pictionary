using Core.Domain.Entities;

namespace Application.Models.Results;

public class JoinRoomResult
{
    public bool Success { get; set; }
    public Room? Room { get; set; }
    public string? ErrorMessage { get; set; }

    public static JoinRoomResult Successful(Room room)
    {
        return new JoinRoomResult
        {
            Success = true,
            Room = room
        };
    }

    public static JoinRoomResult Failed(string errorMessage)
    {
        return new JoinRoomResult
        {
            Success = false,
            ErrorMessage = errorMessage
        };
    }
}