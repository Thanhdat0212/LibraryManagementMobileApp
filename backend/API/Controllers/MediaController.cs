using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/media")]
[Authorize]
public class MediaController : ControllerBase
{
    private readonly ICloudinaryService _cloudinaryService;

    public MediaController(ICloudinaryService cloudinaryService)
    {
        _cloudinaryService = cloudinaryService;
    }

    [HttpGet("signature")]
    public IActionResult GetUploadSignature([FromQuery] string? folder)
    {
        var signature = _cloudinaryService.GenerateUploadSignature(folder);
        return Ok(signature);
    }

    [HttpDelete]
    public async Task<IActionResult> Delete([FromQuery] string publicId, [FromQuery] bool isVideo = false)
    {
        var deleted = await _cloudinaryService.DeleteAsync(publicId, isVideo);
        return deleted ? NoContent() : NotFound();
    }
}
