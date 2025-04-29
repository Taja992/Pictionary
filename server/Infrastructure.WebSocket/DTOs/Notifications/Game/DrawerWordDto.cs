namespace Infrastructure.Websocket.DTOs.Notifications.Game;


public class DrawerWordDto : BaseDto
{
    public string Word { get; set; }

    public DrawerWordDto(string word)
    {
        Word = word;
    }
}