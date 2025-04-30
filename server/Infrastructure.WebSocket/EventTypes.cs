namespace Infrastructure.Websocket;

public static class EventTypes
{
    // Client -> Server events
    public const string ChatMessage = "ChatMessage";
    public const string RoomJoin = "RoomJoin";
    public const string RoomLeave = "RoomLeave";
    public const string DrawEvent = "DrawEvent";
    public const string DrawLine = "DrawLine";
    public const string ClearCanvas = "ClearCanvas";
    
    
    // Server -> Client notifications
    public const string GameCreated = "game:created";
    public const string JoinedGame = "game:joined";
    public const string GameStarted = "game:started";
    public const string RoundStarted = "round:started";
    public const string RoundEnded = "round:ended";
    public const string GameEnded = "game:ended";
    public const string DrawerSelected = "drawer:selected";
    public const string DrawerWord = "drawer:word";
    public const string RoomCreated = "room:created";
    public const string RoomDeleted = "room:deleted";
}