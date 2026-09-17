using Application.DTOs.BookCopy;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/bookcopies")]
[Authorize]
public class BookCopiesController : ControllerBase
{
    private readonly IBookCopyService _bookCopyService;

    public BookCopiesController(IBookCopyService bookCopyService)
    {
        _bookCopyService = bookCopyService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _bookCopyService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var copy = await _bookCopyService.GetByIdAsync(id);
        return copy == null ? NotFound() : Ok(copy);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateBookCopyDto dto)
    {
        var created = await _bookCopyService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBookCopyDto dto)
    {
        var success = await _bookCopyService.UpdateAsync(id, dto);
        return success ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _bookCopyService.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }
}
