namespace Application.DTOs.Dashboard;

public class DashboardSummaryDto
{
    public int TotalBooks { get; set; }
    public int TotalCopies { get; set; }
    public int AvailableCopies { get; set; }
    public int ActiveBorrows { get; set; }
    public int OverdueBorrows { get; set; }
    public int TotalUsers { get; set; }
    public int PendingBorrowRequests { get; set; }
    public int UnpaidFinesCount { get; set; }
    public decimal UnpaidFinesAmount { get; set; }
}
