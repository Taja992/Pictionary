using Application.Interfaces.Services;

namespace Application.Services;

public class WordService : IWordService
{
    private readonly List<string> _words = new List<string>
    {

        "apple", "banana", "car", "dog", "elephant", "flower", "guitar",
        "house", "island", "jungle", "kangaroo", "lion", "mountain"

    };
    
    // category always null because not implemented
    private readonly Dictionary<string, List<string>> _categorizedWords = new Dictionary<string, List<string>>
    {
        ["animals"] = new List<string> { "cat", "dog", "elephant", "lion", "tiger", "zebra" },
        ["food"] = new List<string> { "apple", "banana", "cake", "donut", "egg", "fish" }

    };

    public string GetRandomWord()
    {
        Random random = new Random();
        int index = random.Next(_words.Count);
        return _words[index];
    }

    public string GetRandomWordByCategory(string category)
    {
        if (!_categorizedWords.ContainsKey(category))
        {
            return GetRandomWord();
        }
        
        Random random = new Random();
        var words = _categorizedWords[category];
        int index = random.Next(words.Count);
        return words[index];
    }

    public List<string> GetCategories()
    {
        return _categorizedWords.Keys.ToList();
    }
}