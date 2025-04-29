using System;

namespace Infrastructure.Websocket.DTOs;

public class BaseDto
{
    public BaseDto()
    {
        // Get the actual class name (e.g., "ChatMessageDto")
        var className = GetType().Name;
        
        // Remove "Dto" suffix if present
        if (className.EndsWith("Dto", StringComparison.OrdinalIgnoreCase))
        {
            var baseName = className.Substring(0, className.Length - 3);
            
            // Try to map to a predefined event type from EventTypes class
            eventType = MapToEventType(baseName);
        }
        else
        {
            eventType = className;
        }
    }
    
    /// <summary>
    /// Maps class names to event type constants for consistency
    /// </summary>
    private string MapToEventType(string baseName)
    {
        try
        {
            // Use reflection to get the constant value from EventTypes class
            var field = typeof(EventTypes).GetField(baseName);
            if (field != null)
            {
                return field.GetValue(null) as string ?? baseName;
            }
        }
        catch
        {
            // Fallback to the original name if any error occurs
        }
        
        // If no matching constant exists, return the base name
        return baseName;
    }

    /// <summary>
    /// The type of event this DTO represents.
    /// For a class named "ChatMessageDto", the eventType will be "ChatMessage" by default,
    /// or the matching value from EventTypes if one exists.
    /// </summary>
    public string eventType { get; set; }
    
    /// <summary>
    /// Unique identifier for this message instance. Used to correlate requests with responses.
    /// </summary>
    public string requestId { get; set; } = Guid.NewGuid().ToString();
}