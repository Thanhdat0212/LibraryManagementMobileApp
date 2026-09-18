using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

// Chỉ Admin/thủ thư dùng để tra cứu user khi tạo phiếu mượn tại quầy, và quản lý tài khoản.
[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _userService.GetAllAsync());

    [HttpPut("{id:int}/lock")]
    public async Task<IActionResult> Lock(int id) =>
        await _userService.SetLockedAsync(id, true) ? NoContent() : NotFound();

    [HttpPut("{id:int}/unlock")]
    public async Task<IActionResult> Unlock(int id) =>
        await _userService.SetLockedAsync(id, false) ? NoContent() : NotFound();
}
