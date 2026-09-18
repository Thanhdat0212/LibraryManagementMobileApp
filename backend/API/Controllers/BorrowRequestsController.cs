using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Application.DTOs.BorrowRequest;
using Application.Interfaces.Services;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/borrowrequests")]
[Authorize]
public class BorrowRequestsController : ControllerBase
{
    private readonly IBorrowRequestService _borrowRequestService;

    public BorrowRequestsController(IBorrowRequestService borrowRequestService)
    {
        _borrowRequestService = borrowRequestService;
    }

    // Hàng đợi yêu cầu mượn sách chờ Admin/thủ thư duyệt.
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] BorrowRequestStatus? status) =>
        Ok(await _borrowRequestService.GetAllAsync(status));

    // Member xem yêu cầu mượn của chính mình.
    [HttpGet("my")]
    public async Task<IActionResult> GetMy() => Ok(await _borrowRequestService.GetByUserIdAsync(GetCurrentUserId()));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var request = await _borrowRequestService.GetByIdAsync(id);
        if (request == null) return NotFound();

        if (!User.IsInRole("Admin") && request.UserId != GetCurrentUserId())
            return Forbid();

        return Ok(request);
    }

    // Member tự yêu cầu mượn 1 sách (không cần đến quầy).
    [HttpPost]
    [Authorize(Roles = "Member")]
    public async Task<IActionResult> Create([FromBody] CreateBorrowRequestDto dto)
    {
        var created = await _borrowRequestService.CreateAsync(GetCurrentUserId(), dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // Admin duyệt: tự gán 1 bản sao khả dụng và tạo phiếu mượn.
    [HttpPost("{id:int}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Approve(int id) =>
        Ok(await _borrowRequestService.ApproveAsync(id, GetCurrentUserId()));

    [HttpPost("{id:int}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectBorrowRequestDto dto) =>
        Ok(await _borrowRequestService.RejectAsync(id, GetCurrentUserId(), dto));

    // Member tự hủy yêu cầu của chính mình khi còn đang chờ duyệt.
    [HttpPost("{id:int}/cancel")]
    [Authorize(Roles = "Member")]
    public async Task<IActionResult> Cancel(int id) =>
        Ok(await _borrowRequestService.CancelAsync(id, GetCurrentUserId()));

    private int GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return int.Parse(value!);
    }
}
