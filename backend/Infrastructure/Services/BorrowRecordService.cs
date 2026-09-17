using Application.DTOs.BorrowRecord;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;

namespace Infrastructure.Services;

public class BorrowRecordService : IBorrowRecordService
{
    private readonly IBorrowRecordRepository _borrowRecordRepository;
    private readonly IBookCopyRepository _bookCopyRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public BorrowRecordService(
        IBorrowRecordRepository borrowRecordRepository,
        IBookCopyRepository bookCopyRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _borrowRecordRepository = borrowRecordRepository;
        _bookCopyRepository = bookCopyRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
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

        record.Status = BorrowStatus.Returned;
        record.ReturnDate = DateTime.UtcNow;
        _borrowRecordRepository.Update(record);

        var copy = await _bookCopyRepository.GetByIdAsync(record.BookCopyId);
        if (copy != null)
        {
            copy.Status = BookCopyStatus.Available;
            _bookCopyRepository.Update(copy);
        }

        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}
