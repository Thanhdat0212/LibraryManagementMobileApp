using Application.DTOs.BookCopy;

namespace Application.Interfaces.Services;

public interface IBookCopyService
{
    Task<IEnumerable<BookCopyDto>> GetAllAsync();
    Task<BookCopyDto?> GetByIdAsync(int id);
    Task<BookCopyDto> CreateAsync(CreateBookCopyDto dto);
    Task<bool> UpdateAsync(int id, UpdateBookCopyDto dto);
    Task<bool> DeleteAsync(int id);
}
