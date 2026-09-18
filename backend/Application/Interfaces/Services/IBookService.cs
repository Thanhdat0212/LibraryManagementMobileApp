using Application.DTOs.Book;
using Application.DTOs.Common;

namespace Application.Interfaces.Services;

public interface IBookService
{
    Task<PagedResult<BookDto>> GetAllAsync(BookQueryDto query);
    Task<BookDto?> GetByIdAsync(int id);
    Task<BookDto> CreateAsync(CreateBookDto dto);
    Task<bool> UpdateAsync(int id, UpdateBookDto dto);
    Task<bool> DeleteAsync(int id);
}
