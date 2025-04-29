


namespace Infrastructure.Websocket.DTOs.Notifications.Game;

public class DrawerSelectedDto : BaseDto
{
    public string DrawerId { get; set; } = string.Empty;
    public string DrawerName { get; set; } = string.Empty;
    
    public DrawerSelectedDto(string drawerId, string drawerName)
    {
        DrawerId = drawerId;
        DrawerName = drawerName;
    }
}