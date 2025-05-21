using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

// Create a base repository class that implements common CRUD operations
// This is just to prevent duplication of code across repositories
// extending : class enforces class type constraint(must use objects like Game,User, Score etc cannot use int, string etc)
public abstract class BaseRepository<TEntity> where TEntity : class
{
    protected readonly PictionaryDbContext _context;
    protected readonly DbSet<TEntity> _dbSet;

    protected BaseRepository(PictionaryDbContext context)
    {
        _context = context;
        _dbSet = context.Set<TEntity>();
    }

    // using virtual keyword to allow overriding in classes that extend this
    public virtual async Task<TEntity?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FindAsync([id], cancellationToken);
    }

    public virtual async Task<IEnumerable<TEntity>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.ToListAsync(cancellationToken);
    }

    public virtual async Task<string> CreateAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        
        // This assumes the entity has an Id property
        return entity.GetType().GetProperty("Id")?.GetValue(entity) as string ?? string.Empty;
    }

    public virtual async Task UpdateAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public virtual async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}