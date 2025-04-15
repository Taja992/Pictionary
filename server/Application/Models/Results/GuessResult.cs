namespace Application.Models.Results;

public class GuessResult
{
    public bool IsCorrect { get; set; }
    public int ScoreAwarded { get; set; }

    public static GuessResult Correct(int score)
    {
        return new GuessResult
        {
            IsCorrect = true,
            ScoreAwarded = score
        };
    }

    public static GuessResult Incorrect()
    {
        return new GuessResult
        {
            IsCorrect = false,
            ScoreAwarded = 0
        };
    }
}