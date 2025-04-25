

namespace Api.Rest.DTOs.Game;

    public class GameDto
    {
        public string Id { get; set; } = null!;
        public string RoomId { get; set; } = null!;
        public string Status { get; set; } = null!;
        public int CurrentRound { get; set; }
        public int TotalRounds { get; set; }
        public int RoundTimeSeconds { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? RoundStartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? CurrentDrawerId { get; set; }
        public string? CurrentWord { get; set; } 
        public List<ScoreDto> Scores { get; set; } = new();
    }



