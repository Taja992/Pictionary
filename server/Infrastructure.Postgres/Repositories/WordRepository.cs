using Application.Interfaces.Repositories;
using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class WordRepository : BaseRepository<Word>, IWordRepository
{
    public WordRepository(PictionaryDbContext context) : base(context)
    {
    }

    public override async Task<Word?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await base.GetByIdAsync(id, cancellationToken);
    }

    public async Task<Word?> GetRandomWordAsync(string? category = null, CancellationToken cancellationToken = default)
    {
        // Start with base query
        var query = _dbSet.AsQueryable();
        
        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(w => w.Category == category);
        }
        
        // Get count for random selection
        var count = await query.CountAsync(cancellationToken);
        if (count == 0)
        {
            return null;
        }
        
        // Get random word
        var random = new Random();
        var randomSkip = random.Next(count);
        
        return await query.Skip(randomSkip).FirstOrDefaultAsync(cancellationToken);
    }

    public override async Task<IEnumerable<Word>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await base.GetAllAsync(cancellationToken);
    }

    public override async Task<string> CreateAsync(Word word, CancellationToken cancellationToken = default)
    {
        return await base.CreateAsync(word, cancellationToken);
    }

    public override async Task UpdateAsync(Word word, CancellationToken cancellationToken = default)
    {
        await base.UpdateAsync(word, cancellationToken);
    }

    public async Task IncrementUsageCountAsync(string id, CancellationToken cancellationToken = default)
    {
        var word = await GetByIdAsync(id, cancellationToken);
        if (word != null)
        {
            word.TimesUsed++;
            await UpdateAsync(word, cancellationToken);
        }
    }

    public override async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        await base.DeleteAsync(id, cancellationToken);
    }
}