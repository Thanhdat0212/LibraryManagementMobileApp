using Application.DTOs.Dashboard;

namespace Application.Interfaces.Services;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync();
}
