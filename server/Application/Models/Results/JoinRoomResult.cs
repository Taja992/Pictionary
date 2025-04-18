

namespace Application.Models.Results;

public enum JoinRoomResult
{
    Success,
    NotFound,
    IncorrectPassword,
    RoomFull,
    AlreadyJoined,
    GameInProgress
}