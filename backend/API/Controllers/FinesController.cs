using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Application.Interfaces.Services;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/fines")]
[Authorize]
public class FinesController : ControllerBase
{
    private readonly IFineService _fineService;

    public FinesController(IFineService fineService)
    {
        _fineService = fineService;
    }

    // Admin/thủ thư xem toàn bộ khoản phạt (mặc định) hoặc lọc theo trạng thái.
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] FineStatus? status) => Ok(await _fineService.GetAllAsync(status));

    // Member xem khoản phạt của chính mình.
    [HttpGet("my")]
    public async Task<IActionResult> GetMy() => Ok(await _fineService.GetByUserIdAsync(GetCurrentUserId()));

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var fine = await _fineService.GetByIdAsync(id);
        return fine == null ? NotFound() : Ok(fine);
    }

    // Admin xác nhận đã thu tiền phạt tại quầy.
    [HttpPost("{id:int}/pay")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Pay(int id) => Ok(await _fineService.PayAsync(id));

    private int GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return int.Parse(value!);
    }
}
