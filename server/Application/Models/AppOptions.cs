using System;

namespace Application.Models
{
    public class AppOptions
    {
        public int PORT { get; set; } = 8080;
        public int REST_PORT { get; set; } = 5000;
        public int WS_PORT { get; set; } = 5001;
        
        public string JWT_KEY { get; set; } = "some_random_jwt_key_wowmuchsecure";
        public int JWT_EXPIRE_DAYS { get; set; } = 7;
        
        public string POSTGRES_CONNECTION_STRING { get; set; } = "Host=localhost;Database=pictionary;Username=postgres;Password=postgres";
        
        public bool Seed { get; set; } = false;
        
    }
}