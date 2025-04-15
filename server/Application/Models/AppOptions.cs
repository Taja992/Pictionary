namespace Application.Models
{
    public class JwtSettings
    {
        public string SecretKey { get; set; } = "some_random_jwt_key_wowmuchsecure";
        public string Issuer { get; set; } = "pictionary-api";
        public string Audience { get; set; } = "pictionary-client";
        public int ExpiryMinutes { get; set; } = 60 * 24 * 7; // 7 days in minutes
    }
    
    public class AppOptions
    {
        public int PORT { get; set; } = 8080;
        public int REST_PORT { get; set; } = 5000;
        public int WS_PORT { get; set; } = 5001;
        
        public JwtSettings JwtSettings { get; set; } = new JwtSettings();
        
        public string POSTGRES_CONNECTION_STRING { get; set; } = "Host=localhost;Database=pictionary;Username=postgres;Password=postgres";
        
        public bool Seed { get; set; } = false;
    }
}