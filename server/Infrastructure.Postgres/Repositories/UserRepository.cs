using Application.Interfaces.Repositories;
using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class UserRepository : BaseRepository<User>, IUserRepository
{
    public UserRepository(PictionaryDbContext context) : base(context)
    {
    }

    public override async Task<User?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await base.GetByIdAsync(id, cancellationToken);
    }

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower(), cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower(), cancellationToken);
    }

    public override async Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await base.GetAllAsync(cancellationToken);
    }

    public override async Task<string> CreateAsync(User user, CancellationToken cancellationToken = default)
    {
        return await base.CreateAsync(user, cancellationToken);
    }

    public override async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        await base.UpdateAsync(user, cancellationToken);
    }

    public override async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        await base.DeleteAsync(id, cancellationToken);
    }
}