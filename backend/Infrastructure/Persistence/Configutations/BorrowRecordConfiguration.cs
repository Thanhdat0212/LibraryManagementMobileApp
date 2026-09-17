using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class BorrowRecordConfiguration : IEntityTypeConfiguration<BorrowRecord>
{
    public void Configure(EntityTypeBuilder<BorrowRecord> builder)
    {
        builder.Property(r => r.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(r => r.BookCopy)
            .WithMany(c => c.BorrowRecords)
            .HasForeignKey(r => r.BookCopyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.User)
            .WithMany(u => u.BorrowRecords)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
