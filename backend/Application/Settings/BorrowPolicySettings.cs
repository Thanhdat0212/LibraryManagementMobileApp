namespace Application.Settings;

public class BorrowPolicySettings
{
    public int MaxActiveBorrows { get; set; } = 5;
    public int MaxRenewals { get; set; } = 2;
    public int RenewalExtensionDays { get; set; } = 7;
    public int DefaultBorrowDays { get; set; } = 14;
}
