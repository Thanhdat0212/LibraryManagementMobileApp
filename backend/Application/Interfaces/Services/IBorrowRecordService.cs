using Application.DTOs.BorrowRecord;

namespace Application.Interfaces.Services;

public interface IBorrowRecordService
{
    Task<IEnumerable<BorrowRecordDto>> GetAllAsync();
    Task<IEnumerable<BorrowRecordDto>> GetByUserIdAsync(int userId);
    Task<BorrowRecordDto?> GetByIdAsync(int id);
    Task<BorrowRecordDto> BorrowAsync(CreateBorrowRecordDto dto);
    Task<bool> ReturnAsync(int borrowRecordId);
    Task<BorrowRecordDto> RenewAsync(int borrowRecordId);
}
