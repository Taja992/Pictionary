namespace Api.Rest.DTOs.Game;


    public class ScoreDto
    {
        public string UserId { get; set; } = null!;
        public string Username { get; set; } = null!;
        public int Points { get; set; }
        public int DrawingPoints { get; set; }
        public int GuessingPoints { get; set; }
    }