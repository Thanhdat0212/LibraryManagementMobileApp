using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class BookConfiguration : IEntityTypeConfiguration<Book>
{
    public void Configure(EntityTypeBuilder<Book> builder)
    {
        builder.Property(b => b.Title).IsRequired().HasMaxLength(300);
        builder.Property(b => b.Isbn).IsRequired().HasMaxLength(20);
        builder.HasIndex(b => b.Isbn).IsUnique();

        builder.Property(b => b.CoverImageUrl).HasMaxLength(500);
        builder.Property(b => b.CoverImagePublicId).HasMaxLength(300);

        builder.HasOne(b => b.Publisher)
            .WithMany(p => p.Books)
            .HasForeignKey(b => b.PublisherId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(b => b.Category)
            .WithMany(c => c.Books)
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
