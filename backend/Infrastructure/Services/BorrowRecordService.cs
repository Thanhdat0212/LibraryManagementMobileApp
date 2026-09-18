using Application.DTOs.BorrowRecord;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Application.Settings;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services;

public class BorrowRecordService : IBorrowRecordService
{
    private readonly IBorrowRecordRepository _borrowRecordRepository;
    private readonly IBookCopyRepository _bookCopyRepository;
    private readonly IFineRepository _fineRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly BorrowPolicySettings _policy;
    private readonly FineSettings _fineSettings;

    public BorrowRecordService(
        IBorrowRecordRepository borrowRecordRepository,
        IBookCopyRepository bookCopyRepository,
        IFineRepository fineRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IOptions<BorrowPolicySettings> policyOptions,
        IOptions<FineSettings> fineOptions)
    {
        _borrowRecordRepository = borrowRecordRepository;
        _bookCopyRepository = bookCopyRepository;
        _fineRepository = fineRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _policy = policyOptions.Value;
        _fineSettings = fineOptions.Value;
    }

    public async Task<IEnumerable<BorrowRecordDto>> GetAllAsync()
    {
        var records = await _borrowRecordRepository.GetAllWithDetailsAsync();
        return _mapper.Map<IEnumerable<BorrowRecordDto>>(records);
    }

    public async Task<BorrowRecordDto?> GetByIdAsync(int id)
    {
        var record = await _borrowRecordRepository.GetByIdWithDetailsAsync(id);
        return record == null ? null : _mapper.Map<BorrowRecordDto>(record);
    }

    public async Task<IEnumerable<BorrowRecordDto>> GetByUserIdAsync(int userId)
    {
        var records = await _borrowRecordRepository.GetAllByUserIdAsync(userId);
        return _mapper.Map<IEnumerable<BorrowRecordDto>>(records);
    }

    public async Task<BorrowRecordDto> BorrowAsync(CreateBorrowRecordDto dto)
    {
        var copy = await _bookCopyRepository.GetByIdAsync(dto.BookCopyId)
            ?? throw new InvalidOperationException("Không tìm thấy bản sao sách.");

        if (copy.Status != BookCopyStatus.Available)
            throw new InvalidOperationException("Bản sao sách này hiện không sẵn để mượn.");

        var record = new BorrowRecord
        {
            BookCopyId = dto.BookCopyId,
            UserId = dto.UserId,
            DueDate = dto.DueDate,
            Status = BorrowStatus.Borrowing
        };

        copy.Status = BookCopyStatus.Borrowed;
        _bookCopyRepository.Update(copy);

        await _borrowRecordRepository.AddAsync(record);
        await _unitOfWork.SaveChangesAsync();

        var created = await _borrowRecordRepository.GetByIdWithDetailsAsync(record.Id);
        return _mapper.Map<BorrowRecordDto>(created);
    }

    public async Task<bool> ReturnAsync(int borrowRecordId)
    {
        var record = await _borrowRecordRepository.GetByIdAsync(borrowRecordId);
        if (record == null || record.Status == BorrowStatus.Returned) return false;

        var returnDate = DateTime.UtcNow;
        record.Status = BorrowStatus.Returned;
        record.ReturnDate = returnDate;
        _borrowRecordRepository.Update(record);

        var copy = await _bookCopyRepository.GetByIdAsync(record.BookCopyId);
        if (copy != null)
        {
            copy.Status = BookCopyStatus.Available;
            _bookCopyRepository.Update(copy);
        }

        // Trả trễ hạn -> tự động lập phiếu phạt (số ngày trễ x đơn giá/ngày, chặn ở mức tối đa).
        if (returnDate > record.DueDate)
        {
            var daysLate = (int)Math.Ceiling((returnDate - record.DueDate).TotalDays);
            var amount = Math.Min(daysLate * _fineSettings.PerDayAmount, _fineSettings.MaxAmount);
            await _fineRepository.AddAsync(new Fine
            {
                BorrowRecordId = record.Id,
                Amount = amount,
                Reason = FineReason.Overdue,
                Status = FineStatus.Unpaid
            });
        }

        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<BorrowRecordDto> RenewAsync(int borrowRecordId)
    {
        var record = await _borrowRecordRepository.GetByIdAsync(borrowRecordId)
            ?? throw new InvalidOperationException("Không tìm thấy phiếu mượn.");

        if (record.Status != BorrowStatus.Borrowing)
            throw new InvalidOperationException("Chỉ có thể gia hạn phiếu mượn đang mượn.");

        if (record.DueDate < DateTime.UtcNow)
            throw new InvalidOperationException("Sách đã quá hạn, không thể tự gia hạn. Vui lòng liên hệ thủ thư.");

        if (record.RenewalCount >= _policy.MaxRenewals)
            throw new InvalidOperationException($"Đã đạt số lần gia hạn tối đa ({_policy.MaxRenewals} lần) cho phiếu mượn này.");

        record.DueDate = record.DueDate.AddDays(_policy.RenewalExtensionDays);
        record.RenewalCount += 1;
        _borrowRecordRepository.Update(record);
        await _unitOfWork.SaveChangesAsync();

        var updated = await _borrowRecordRepository.GetByIdWithDetailsAsync(record.Id);
        return _mapper.Map<BorrowRecordDto>(updated);
    }
}
