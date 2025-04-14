using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Postgres.Configurations;

public class GameConfiguration : IEntityTypeConfiguration<Game>
{
    public void Configure(EntityTypeBuilder<Game> builder)
    {
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id).ValueGeneratedOnAdd();

        builder.Property(g => g.RoomId).IsRequired();
        builder.Property(g => g.StartTime).IsRequired();
        builder.Property(g => g.Status).IsRequired();
        builder.Property(g => g.CurrentRound).IsRequired();
        builder.Property(g => g.TotalRounds).IsRequired();
        builder.Property(g => g.RoundTimeSeconds).IsRequired();

        // Configure relationships
        builder.HasOne(g => g.Room)
            .WithOne(r => r.CurrentGame)
            .HasForeignKey<Game>(g => g.RoomId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(g => g.CurrentDrawer)
            .WithMany()
            .HasForeignKey(g => g.CurrentDrawerId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(g => g.CurrentWord)
            .WithMany(w => w.Games)
            .HasForeignKey(g => g.CurrentWordId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(g => g.Scores)
            .WithOne(s => s.Game)
            .HasForeignKey(s => s.GameId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}