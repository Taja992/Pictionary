using Application.Interfaces.Repositories;
using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class UserRepository : BaseRepository<User>, IUserRepository
{
    public UserRepository(PictionaryDbContext context) : base(context)
    {
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

    public override async Task<string> CreateAsync(User user, CancellationToken cancellationToken = default)
    {
        return await base.CreateAsync(user, cancellationToken);
    }

    public override async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        await base.UpdateAsync(user, cancellationToken);
    }
    
}