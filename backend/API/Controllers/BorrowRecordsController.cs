using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Application.DTOs.BorrowRecord;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/borrowrecords")]
[Authorize]
public class BorrowRecordsController : ControllerBase
{
    private readonly IBorrowRecordService _borrowRecordService;

    public BorrowRecordsController(IBorrowRecordService borrowRecordService)
    {
        _borrowRecordService = borrowRecordService;
    }

    // Chỉ Admin/thủ thư được xem toàn bộ phiếu mượn của mọi người.
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll() => Ok(await _borrowRecordService.GetAllAsync());

    // Bất kỳ user đã đăng nhập nào cũng xem được lịch sử mượn của CHÍNH MÌNH.
    // UserId luôn lấy từ token, không nhận từ client, để tránh xem được của người khác.
    [HttpGet("my")]
    public async Task<IActionResult> GetMy()
    {
        var userId = GetCurrentUserId();
        return Ok(await _borrowRecordService.GetByUserIdAsync(userId));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var record = await _borrowRecordService.GetByIdAsync(id);
        if (record == null) return NotFound();

        // Member chỉ được xem phiếu mượn của chính mình; Admin xem được tất cả.
        if (!User.IsInRole("Admin") && record.UserId != GetCurrentUserId())
            return Forbid();

        return Ok(record);
    }

    // Chỉ Admin/thủ thư tạo phiếu mượn (thao tác khi giao sách vật lý tại quầy).
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Borrow([FromBody] CreateBorrowRecordDto dto)
    {
        var created = await _borrowRecordService.BorrowAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // Chỉ Admin/thủ thư xác nhận trả sách (thao tác khi nhận lại sách vật lý).
    [HttpPost("{id:int}/return")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Return(int id)
    {
        var success = await _borrowRecordService.ReturnAsync(id);
        return success
            ? Ok(new { message = "Trả sách thành công." })
            : NotFound(new { message = "Không tìm thấy phiếu mượn hoặc đã được trả trước đó." });
    }

    // Member tự gia hạn phiếu mượn của chính mình; Admin gia hạn được cho bất kỳ ai.
    [HttpPost("{id:int}/renew")]
    public async Task<IActionResult> Renew(int id)
    {
        var record = await _borrowRecordService.GetByIdAsync(id);
        if (record == null) return NotFound();

        if (!User.IsInRole("Admin") && record.UserId != GetCurrentUserId())
            return Forbid();

        return Ok(await _borrowRecordService.RenewAsync(id));
    }

    private int GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return int.Parse(value!);
    }
}
