namespace Api.Rest.DTOs.Game;


    public class WordDto
    {
        public string Id { get; set; } = null!;
        public string Text { get; set; } = null!;
        public string? Category { get; set; }
    }
