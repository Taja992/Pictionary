using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Postgres.Configurations;

public class WordConfiguration : IEntityTypeConfiguration<Word>
{
    public void Configure(EntityTypeBuilder<Word> builder)
    {
        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id).ValueGeneratedOnAdd();
        
        builder.Property(w => w.Text).IsRequired().HasMaxLength(50);
        builder.HasIndex(w => w.Text).IsUnique();
        
        builder.Property(w => w.Difficulty).IsRequired();
        builder.Property(w => w.Category).HasMaxLength(50);
        builder.Property(w => w.TimesUsed).IsRequired();
    }
}