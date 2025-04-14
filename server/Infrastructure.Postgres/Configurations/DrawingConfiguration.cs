using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Postgres.Configurations;

public class DrawingConfiguration : IEntityTypeConfiguration<Drawing>
{
    public void Configure(EntityTypeBuilder<Drawing> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).ValueGeneratedOnAdd();
        
        builder.Property(d => d.GameId).IsRequired();
        builder.Property(d => d.DrawerId).IsRequired();
        builder.Property(d => d.WordId).IsRequired();
        builder.Property(d => d.DrawingData).IsRequired();
        builder.Property(d => d.CreatedAt).IsRequired();
        
  
        builder.HasOne(d => d.Game)
            .WithMany(g => g.Drawings)
            .HasForeignKey(d => d.GameId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(d => d.Drawer)
            .WithMany()
            .HasForeignKey(d => d.DrawerId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(d => d.Word)
            .WithMany()
            .HasForeignKey(d => d.WordId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}