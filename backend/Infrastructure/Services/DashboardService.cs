using Application.DTOs.Dashboard;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;

namespace Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly IBookRepository _bookRepository;
    private readonly IBookCopyRepository _bookCopyRepository;
    private readonly IBorrowRecordRepository _borrowRecordRepository;
    private readonly IUserRepository _userRepository;
    private readonly IBorrowRequestRepository _borrowRequestRepository;
    private readonly IFineRepository _fineRepository;

    public DashboardService(
        IBookRepository bookRepository,
        IBookCopyRepository bookCopyRepository,
        IBorrowRecordRepository borrowRecordRepository,
        IUserRepository userRepository,
        IBorrowRequestRepository borrowRequestRepository,
        IFineRepository fineRepository)
    {
        _bookRepository = bookRepository;
        _bookCopyRepository = bookCopyRepository;
        _borrowRecordRepository = borrowRecordRepository;
        _userRepository = userRepository;
        _borrowRequestRepository = borrowRequestRepository;
        _fineRepository = fineRepository;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        var unpaidFines = await _fineRepository.GetUnpaidSummaryAsync();

        return new DashboardSummaryDto
        {
            TotalBooks = await _bookRepository.CountAsync(),
            TotalCopies = await _bookCopyRepository.CountAsync(),
            AvailableCopies = await _bookCopyRepository.CountAvailableAsync(),
            ActiveBorrows = await _borrowRecordRepository.CountActiveAsync(),
            OverdueBorrows = await _borrowRecordRepository.CountOverdueAsync(),
            TotalUsers = await _userRepository.CountAsync(),
            PendingBorrowRequests = await _borrowRequestRepository.CountPendingAsync(),
            UnpaidFinesCount = unpaidFines.Count,
            UnpaidFinesAmount = unpaidFines.Amount
        };
    }
}
