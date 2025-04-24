namespace Application.Interfaces.Services;

public interface IWordService
{
    string GetRandomWord();
    string GetRandomWordByCategory(string category);
    List<string> GetCategories();
}