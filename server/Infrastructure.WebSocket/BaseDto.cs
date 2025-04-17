namespace Infrastructure.WebSocket;

/// <summary>
/// Base class for all Data Transfer Objects used in WebSocket communication.
/// Provides automatic message type identification and request correlation.
/// </summary>
/// <remarks>
/// All WebSocket messages should inherit from this class to ensure:
/// 1. Every message has an eventType for message routing
/// 2. Every message has a requestId for request-response correlation
/// 3. Consistent message structure across the entire application
/// </remarks>
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