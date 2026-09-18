using Application.DTOs.BorrowRequest;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Application.Settings;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services;

public class BorrowRequestService : IBorrowRequestService
{
    private readonly IBorrowRequestRepository _borrowRequestRepository;
    private readonly IBookRepository _bookRepository;
    private readonly IBookCopyRepository _bookCopyRepository;
    private readonly IBorrowRecordRepository _borrowRecordRepository;
    private readonly IUserRepository _userRepository;
    private readonly IFineRepository _fineRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly BorrowPolicySettings _policy;

    public BorrowRequestService(
        IBorrowRequestRepository borrowRequestRepository,
        IBookRepository bookRepository,
        IBookCopyRepository bookCopyRepository,
        IBorrowRecordRepository borrowRecordRepository,
        IUserRepository userRepository,
        IFineRepository fineRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IOptions<BorrowPolicySettings> policyOptions)
    {
        _borrowRequestRepository = borrowRequestRepository;
        _bookRepository = bookRepository;
        _bookCopyRepository = bookCopyRepository;
        _borrowRecordRepository = borrowRecordRepository;
        _userRepository = userRepository;
        _fineRepository = fineRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _policy = policyOptions.Value;
    }

    public async Task<IEnumerable<BorrowRequestDto>> GetAllAsync(BorrowRequestStatus? status)
    {
        var requests = await _borrowRequestRepository.GetAllWithDetailsAsync(status);
        return _mapper.Map<IEnumerable<BorrowRequestDto>>(requests);
    }

    public async Task<IEnumerable<BorrowRequestDto>> GetByUserIdAsync(int userId)
    {
        var requests = await _borrowRequestRepository.GetAllByUserIdAsync(userId);
        return _mapper.Map<IEnumerable<BorrowRequestDto>>(requests);
    }

    public async Task<BorrowRequestDto?> GetByIdAsync(int id)
    {
        var request = await _borrowRequestRepository.GetByIdWithDetailsAsync(id);
        return request == null ? null : _mapper.Map<BorrowRequestDto>(request);
    }

    public async Task<BorrowRequestDto> CreateAsync(int userId, CreateBorrowRequestDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new InvalidOperationException("Không tìm thấy người dùng.");
        if (user.IsLocked)
            throw new InvalidOperationException("Tài khoản của bạn đã bị khóa, vui lòng liên hệ thủ thư.");

        _ = await _bookRepository.GetByIdAsync(dto.BookId)
            ?? throw new InvalidOperationException("Không tìm thấy sách.");

        if (await _borrowRequestRepository.HasPendingRequestAsync(userId, dto.BookId))
            throw new InvalidOperationException("Bạn đã có yêu cầu đang chờ xử lý cho sách này.");

        if (await _fineRepository.HasUnpaidFineAsync(userId))
            throw new InvalidOperationException("Bạn còn khoản phạt chưa thanh toán, vui lòng thanh toán trước khi mượn sách mới.");

        var activeCount = await _borrowRecordRepository.CountActiveByUserIdAsync(userId);
        if (activeCount >= _policy.MaxActiveBorrows)
            throw new InvalidOperationException($"Bạn đã đạt giới hạn {_policy.MaxActiveBorrows} sách được mượn đồng thời.");

        var request = new BorrowRequest
        {
            BookId = dto.BookId,
            UserId = userId,
            Note = dto.Note,
            Status = BorrowRequestStatus.Pending
        };

        await _borrowRequestRepository.AddAsync(request);
        await _unitOfWork.SaveChangesAsync();

        var created = await _borrowRequestRepository.GetByIdWithDetailsAsync(request.Id);
        return _mapper.Map<BorrowRequestDto>(created);
    }

    public async Task<BorrowRequestDto> ApproveAsync(int id, int processedByUserId)
    {
        var request = await _borrowRequestRepository.GetByIdWithDetailsAsync(id)
            ?? throw new InvalidOperationException("Không tìm thấy yêu cầu mượn sách.");

        if (request.Status != BorrowRequestStatus.Pending)
            throw new InvalidOperationException("Yêu cầu này đã được xử lý trước đó.");

        var copy = await _bookCopyRepository.GetFirstAvailableByBookIdAsync(request.BookId)
            ?? throw new InvalidOperationException("Hiện không có bản sao nào khả dụng cho sách này.");

        var record = new BorrowRecord
        {
            BookCopyId = copy.Id,
            UserId = request.UserId,
            DueDate = DateTime.UtcNow.AddDays(_policy.DefaultBorrowDays),
            Status = BorrowStatus.Borrowing
        };

        copy.Status = BookCopyStatus.Borrowed;
        _bookCopyRepository.Update(copy);

        await _borrowRecordRepository.AddAsync(record);

        request.Status = BorrowRequestStatus.Approved;
        request.ProcessedAt = DateTime.UtcNow;
        request.ProcessedByUserId = processedByUserId;
        request.ResultingBorrowRecord = record;
        _borrowRequestRepository.Update(request);

        await _unitOfWork.SaveChangesAsync();

        var updated = await _borrowRequestRepository.GetByIdWithDetailsAsync(id);
        return _mapper.Map<BorrowRequestDto>(updated);
    }

    public async Task<BorrowRequestDto> RejectAsync(int id, int processedByUserId, RejectBorrowRequestDto dto)
    {
        var request = await _borrowRequestRepository.GetByIdWithDetailsAsync(id)
            ?? throw new InvalidOperationException("Không tìm thấy yêu cầu mượn sách.");

        if (request.Status != BorrowRequestStatus.Pending)
            throw new InvalidOperationException("Yêu cầu này đã được xử lý trước đó.");

        request.Status = BorrowRequestStatus.Rejected;
        request.ProcessedAt = DateTime.UtcNow;
        request.ProcessedByUserId = processedByUserId;
        if (!string.IsNullOrWhiteSpace(dto.Reason))
            request.Note = dto.Reason;

        _borrowRequestRepository.Update(request);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<BorrowRequestDto>(request);
    }
}
