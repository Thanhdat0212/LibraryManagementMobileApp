using Application.DTOs.Author;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using AutoMapper;
using Domain.Entities;


namespace Infrastructure.Services;

public class AuthorService : IAuthorService
{
    private readonly IRepository<Author> _authorRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AuthorService(IRepository<Author> authorRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _authorRepository = authorRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }
    public async Task<IEnumerable<AuthorDto>> GetAllAsync()
    {
        var authors = await _authorRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<AuthorDto>>(authors);
    }

    public async Task<AuthorDto?> GetByIdAsync(int id)
    {
        var author = await _authorRepository.GetByIdAsync(id);
        return author == null ? null : _mapper.Map<AuthorDto>(author);
    }

    public async Task<AuthorDto> CreateAsync(CreateAuthorDto dto)
    {
        var author = _mapper.Map<Author>(dto);
        await _authorRepository.AddAsync(author);
        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<AuthorDto>(author);
    }

    public async Task<bool> UpdateAsync(int id, UpdateAuthorDto dto)
    {
        var author = await _authorRepository.GetByIdAsync(id);
        if (author == null) return false;

        _mapper.Map(dto, author);
        _authorRepository.Update(author);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var author = await _authorRepository.GetByIdAsync(id);
        if (author == null) return false;

        _authorRepository.Remove(author);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}