using Application.DTOs.BookCopy;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;

namespace Infrastructure.Services;

public class BookCopyService : IBookCopyService
{
    private readonly IBookCopyRepository _bookCopyRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public BookCopyService(IBookCopyRepository bookCopyRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _bookCopyRepository = bookCopyRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<BookCopyDto>> GetAllAsync()
    {
        var copies = await _bookCopyRepository.GetAllWithBookAsync();
        return _mapper.Map<IEnumerable<BookCopyDto>>(copies);
    }

    public async Task<BookCopyDto?> GetByIdAsync(int id)
    {
        var copy = await _bookCopyRepository.GetByIdWithBookAsync(id);
        return copy == null ? null : _mapper.Map<BookCopyDto>(copy);
    }

    public async Task<BookCopyDto> CreateAsync(CreateBookCopyDto dto)
    {
        var copy = _mapper.Map<BookCopy>(dto);
        copy.Status = BookCopyStatus.Available;

        await _bookCopyRepository.AddAsync(copy);
        await _unitOfWork.SaveChangesAsync();

        var created = await _bookCopyRepository.GetByIdWithBookAsync(copy.Id);
        return _mapper.Map<BookCopyDto>(created);
    }

    public async Task<bool> UpdateAsync(int id, UpdateBookCopyDto dto)
    {
        var copy = await _bookCopyRepository.GetByIdAsync(id);
        if (copy == null) return false;

        copy.CopyCode = dto.CopyCode;
        if (Enum.TryParse<BookCopyStatus>(dto.Status, out var status))
            copy.Status = status;

        _bookCopyRepository.Update(copy);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var copy = await _bookCopyRepository.GetByIdAsync(id);
        if (copy == null) return false;

        _bookCopyRepository.Remove(copy);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}
