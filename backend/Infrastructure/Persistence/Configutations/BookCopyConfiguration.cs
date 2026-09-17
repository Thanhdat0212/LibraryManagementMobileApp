using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class BookCopyConfiguration : IEntityTypeConfiguration<BookCopy>
{
    public void Configure(EntityTypeBuilder<BookCopy> builder)
    {
        builder.Property(c => c.CopyCode).IsRequired().HasMaxLength(50);
        builder.HasIndex(c => c.CopyCode).IsUnique();
        builder.Property(c => c.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(c => c.Book)
            .WithMany(b => b.BookCopies)
            .HasForeignKey(c => c.BookId);
    }
}
