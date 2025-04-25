using Microsoft.EntityFrameworkCore;
using Core.Domain.Entities;

namespace Infrastructure.Websocket.DTOs.DTOs.Postgres;

public class PictionaryDbContext : DbContext
{
    public PictionaryDbContext(DbContextOptions<PictionaryDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Room> Rooms { get; set; } = null!;
    public DbSet<Game> Games { get; set; } = null!;
    public DbSet<Score> Scores { get; set; } = null!;


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PictionaryDbContext).Assembly);
    }

}
