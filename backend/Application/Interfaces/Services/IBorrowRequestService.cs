using Application.DTOs.BorrowRequest;
using Domain.Enums;

namespace Application.Interfaces.Services;

public interface IBorrowRequestService
{
    Task<IEnumerable<BorrowRequestDto>> GetAllAsync(BorrowRequestStatus? status);
    Task<IEnumerable<BorrowRequestDto>> GetByUserIdAsync(int userId);
    Task<BorrowRequestDto?> GetByIdAsync(int id);
    Task<BorrowRequestDto> CreateAsync(int userId, CreateBorrowRequestDto dto);
    Task<BorrowRequestDto> ApproveAsync(int id, int processedByUserId);
    Task<BorrowRequestDto> RejectAsync(int id, int processedByUserId, RejectBorrowRequestDto dto);
}
