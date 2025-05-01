using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Postgres.Configurations;

public class ScoreConfiguration : IEntityTypeConfiguration<Score>
{
    public void Configure(EntityTypeBuilder<Score> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).ValueGeneratedOnAdd();
        
        builder.Property(s => s.GameId).IsRequired();
        builder.Property(s => s.UserId).IsRequired();
        builder.Property(s => s.Points).IsRequired();
        builder.Property(s => s.UpdatedAt).IsRequired();
        
        
        builder.HasOne(s => s.Game)
            .WithMany(g => g.Scores)
            .HasForeignKey(s => s.GameId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(s => s.User)
            .WithMany(u => u.Scores)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}