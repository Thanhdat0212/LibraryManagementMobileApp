using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class FineConfiguration : IEntityTypeConfiguration<Fine>
{
    public void Configure(EntityTypeBuilder<Fine> builder)
    {
        builder.Property(f => f.Amount).HasColumnType("decimal(12,2)");
        builder.Property(f => f.Reason).HasConversion<string>().HasMaxLength(20);
        builder.Property(f => f.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(f => f.BorrowRecord)
            .WithOne(r => r.Fine)
            .HasForeignKey<Fine>(f => f.BorrowRecordId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
