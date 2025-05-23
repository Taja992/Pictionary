namespace Application.Models
{
    // public class JwtSettings
    // {
    //     public string SecretKey { get; set; } = "some_random_jwt_key_wowmuchsecure";
    //     public string Issuer { get; set; } = "pictionary-api";
    //     public string Audience { get; set; } = "pictionary-client";
    //     public int ExpiryMinutes { get; set; } = 60 * 24 * 7; // 7 days in minutes
    // }
    
    public class WebSocketOptions
    {
        public int ConnectionTimeoutMinutes { get; set; } = 5;
        public int MonitorCheckIntervalMinutes { get; set; } = 5;
    }
    
    public class AppOptions
    {        
        public string POSTGRES_CONNECTION_STRING { get; set; } = "Host=localhost;Database=pictionary;Username=postgres;Password=postgres";
        public WebSocketOptions WebSocket { get; set; } = new WebSocketOptions();
    }
}