using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "Admin")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    // Số liệu tổng hợp tính trực tiếp ở DB (COUNT/SUM), tránh phải tải toàn bộ
    // bảng Books/BookCopies/BorrowRecords/Users về client như cách làm cũ.
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary() => Ok(await _dashboardService.GetSummaryAsync());
}
