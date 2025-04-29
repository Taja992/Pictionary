// using System.Text.Json.Serialization;
//
// namespace Infrastructure.Websocket.DTOs;
//
// /// <summary>
// /// Base class for all game-related notification messages
// /// </summary>
// public abstract class GameNotificationDto : BaseDto
// {
//     protected GameNotificationDto()
//     {
//         // Override the automatically generated eventType from BaseDto
//         // with our specific format
//         var className = GetType().Name;
//         var suffix = "Notification";
//         
//         // Remove "Notification" suffix if present
//         if (className.EndsWith(suffix))
//         {
//             var baseName = className.Substring(0, className.Length - suffix.Length);
//             eventType = FormatNotificationType(baseName);
//         }
//         else
//         {
//             eventType = FormatNotificationType(className);
//         }
//     }
//     
//     /// <summary>
//     /// Formats the class name into a notification type string
//     /// </summary>
//     private string FormatNotificationType(string baseName)
//     {
//         // Handle specific cases for the notification types
//         switch (baseName)
//         {
//             // Game Notifications
//             case "GameCreated": return EventTypes.GameCreated;
//             case "GameStarted": return EventTypes.GameStarted;
//             case "GameEnded": return EventTypes.GameEnded;
//             case "RoundStarted": return EventTypes.RoundStarted;
//             case "RoundEnded": return EventTypes.RoundEnded;
//             case "DrawerWord": return EventTypes.DrawerWord;
//             case "DrawerSelected": return EventTypes.DrawerSelected;
//         
//             // Room Notifications
//             case "RoomCreated": return EventTypes.RoomCreated;
//             case "RoomDeleted": return EventTypes.RoomDeleted;
//             
//             default: return baseName.ToLower();
//         }
//     }
// }
//
// /// <summary>
// /// Base class for game notifications that include a gameId
// /// </summary>
// public abstract class GameEventNotificationDto : GameNotificationDto
// {
//     protected GameEventNotificationDto(string gameId)
//     {
//         this.gameId = gameId;
//     }
//
//     /// <summary>
//     /// ID of the game this notification relates to
//     /// </summary>
//     public string gameId { get; set; } = string.Empty;
// }
//
// /// <summary>
// /// Notification sent when a new game is created
// /// </summary>
// public class GameCreatedNotification : GameEventNotificationDto
// {
//     public string status { get; set; } = string.Empty;
//     public int totalRounds { get; set; }
//     public int timePerRound { get; set; }
//     
//     public GameCreatedNotification(string gameId, string status, int totalRounds, int timePerRound)
//         : base(gameId)
//     {
//         this.status = status;
//         this.totalRounds = totalRounds;
//         this.timePerRound = timePerRound;
//     }
// }
//
// /// <summary>
// /// Notification sent when a game starts
// /// </summary>
// public class GameStartedNotification : GameEventNotificationDto
// {
//     public int currentRound { get; set; }
//     
//     public GameStartedNotification(string gameId, int currentRound)
//         : base(gameId)
//     {
//         this.currentRound = currentRound;
//     }
// }
//
// /// <summary>
// /// Notification sent when a round starts
// /// </summary>
// public class RoundStartedNotification : GameEventNotificationDto
// {
//     public int roundNumber { get; set; }
//     public int totalRounds { get; set; }
//     public string drawerId { get; set; } = string.Empty;
//     public string? startTime { get; set; }
//     public int durationSeconds { get; set; }
//     
//     public RoundStartedNotification(string gameId, int roundNumber, int totalRounds, 
//                                   string drawerId, string? startTime, int durationSeconds)
//         : base(gameId)
//     {
//         this.roundNumber = roundNumber;
//         this.totalRounds = totalRounds;
//         this.drawerId = drawerId;
//         this.startTime = startTime;
//         this.durationSeconds = durationSeconds;
//     }
// }
//
// /// <summary>
// /// Notification sent when a round ends
// /// </summary>
// public class RoundEndedNotification : GameEventNotificationDto
// {
//     public int roundNumber { get; set; }
//     public int totalRounds { get; set; }
//     public bool isLastRound { get; set; }
//     
//     public RoundEndedNotification(string gameId, int roundNumber, int totalRounds, bool isLastRound)
//         : base(gameId)
//     {
//         this.roundNumber = roundNumber;
//         this.totalRounds = totalRounds;
//         this.isLastRound = isLastRound;
//     }
// }
//
// /// <summary>
// /// Notification sent when a game ends
// /// </summary>
// public class GameEndedNotification : GameEventNotificationDto
// {
//     public string status { get; set; } = string.Empty;
//     
//     public GameEndedNotification(string gameId, string status)
//         : base(gameId)
//     {
//         this.status = status;
//     }
// }
//
// /// <summary>
// /// Notification sent to the drawer with the word to draw
// /// </summary>
// public class DrawerWordNotification : GameNotificationDto
// {
//     public string word { get; set; } = string.Empty;
//     
//     public DrawerWordNotification(string word)
//     {
//         this.word = word;
//     }
// }
//
// /// <summary>
// /// Notification sent when a drawer is selected for a round
// /// </summary>
// public class DrawerSelectedNotification : GameNotificationDto
// {
//     public string drawerId { get; set; } = string.Empty;
//     public string drawerName { get; set; } = string.Empty;
//     
//     public DrawerSelectedNotification(string drawerId, string drawerName)
//     {
//         this.drawerId = drawerId;
//         this.drawerName = drawerName;
//     }
// }
//
// public class RoomCreatedNotification : GameNotificationDto
// {
//     public string roomId { get; set; } = string.Empty;
//     public string roomName { get; set; } = string.Empty;
//     public string ownerId { get; set; } = string.Empty;
//     public string ownerName { get; set; } = string.Empty;
//     public bool isPrivate { get; set; }
//
//     public RoomCreatedNotification(string roomId, string roomName, string ownerId, string ownerName, bool isPrivate)
//     {
//         this.roomId = roomId;
//         this.roomName = roomName;
//         this.ownerId = ownerId;
//         this.ownerName = ownerName;
//         this.isPrivate = isPrivate;
//     }
// }
//
// public class RoomDeletedNotification : GameNotificationDto
// {
//     public string roomId { get; set; } = string.Empty;
//     
//     public RoomDeletedNotification(string roomId)
//     {
//         this.roomId = roomId;
//     }
// }