namespace Infrastructure.Websocket.DTOs;

public class BaseDto
{
    public BaseDto()
    {
        // Get the actual class name (e.g., "ChatMessageDto")
        var eventType = GetType().Name;
        
        // Check if the name ends with "Dto" (last 3 characters)
        var subString = eventType.Substring(eventType.Length - 3);
        if (subString.ToLower().Equals("dto"))
            // Remove "Dto" suffix for cleaner type names (e.g., "ChatMessage")
            this.eventType = eventType.Substring(0, eventType.Length - 3);
        else
            this.eventType = eventType;
    }

    /// <example>
    /// For a class named "ChatMessageDto", the eventType will be "ChatMessage".
    /// </example>
    public string eventType { get; set; }
    
    /// <summary>
    /// Unique identifier for this message instance. Used to correlate requests with responses.
    /// Automatically generated as a GUID string for each new DTO instance.
    /// </summary>
    /// <remarks>
    /// When responding to a client request, handlers should set this to match the original request's ID.
    /// </remarks>
    public string requestId { get; set; } = Guid.NewGuid().ToString();
}