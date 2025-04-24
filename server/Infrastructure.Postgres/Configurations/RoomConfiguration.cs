using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace Infrastructure.Postgres.Configurations;

public class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).ValueGeneratedOnAdd();

        builder.Property(r => r.Name).IsRequired().HasMaxLength(100);
        builder.Property(r => r.OwnerId).IsRequired();
        builder.Property(r => r.MaxPlayers).IsRequired();
        builder.Property(r => r.IsPrivate).IsRequired();
        builder.Property(r => r.Password).HasMaxLength(100);
        builder.Property(r => r.CreatedAt).IsRequired();
        builder.Property(r => r.Status).IsRequired();

        builder.HasOne(r => r.Owner)
            .WithMany()
            .HasForeignKey(r => r.OwnerId)
            .OnDelete(DeleteBehavior.Cascade); // This is restricted to prevent deletion of all rooms if owner is deleted

        builder.HasMany(r => r.Players)
            .WithMany()
            .UsingEntity<Dictionary<string, object>>(
                "RoomPlayers",
                j => j.HasOne<User>().WithMany().OnDelete(DeleteBehavior.Cascade),
                j => j.HasOne<Room>().WithMany().OnDelete(DeleteBehavior.Cascade)
            );
    }
}