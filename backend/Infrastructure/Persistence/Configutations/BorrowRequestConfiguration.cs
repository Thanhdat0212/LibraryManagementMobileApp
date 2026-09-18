using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class BorrowRequestConfiguration : IEntityTypeConfiguration<BorrowRequest>
{
    public void Configure(EntityTypeBuilder<BorrowRequest> builder)
    {
        builder.Property(r => r.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(r => r.Note).HasMaxLength(500);

        builder.HasOne(r => r.Book)
            .WithMany()
            .HasForeignKey(r => r.BookId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.User)
            .WithMany(u => u.BorrowRequests)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.ProcessedByUser)
            .WithMany()
            .HasForeignKey(r => r.ProcessedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.ResultingBorrowRecord)
            .WithOne()
            .HasForeignKey<BorrowRequest>(r => r.ResultingBorrowRecordId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
