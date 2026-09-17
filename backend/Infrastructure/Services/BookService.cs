using Application.DTOs.Book;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using AutoMapper;
using Domain.Entities;

namespace Infrastructure.Services;

public class BookService : IBookService
{
    private readonly IBookRepository _bookRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public BookService(IBookRepository bookRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _bookRepository = bookRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<BookDto>> GetAllAsync()
    {
        var books = await _bookRepository.GetAllWithDetailsAsync();
        return _mapper.Map<IEnumerable<BookDto>>(books);
    }

    public async Task<BookDto?> GetByIdAsync(int id)
    {
        var book = await _bookRepository.GetByIdWithDetailsAsync(id);
        return book == null ? null : _mapper.Map<BookDto>(book);
    }

    public async Task<BookDto> CreateAsync(CreateBookDto dto)
    {
        var book = _mapper.Map<Book>(dto);
        book.BookAuthors = dto.AuthorIds
            .Select(authorId => new BookAuthor { AuthorId = authorId })
            .ToList();

        await _bookRepository.AddAsync(book);
        await _unitOfWork.SaveChangesAsync();

        var created = await _bookRepository.GetByIdWithDetailsAsync(book.Id);
        return _mapper.Map<BookDto>(created);
    }

    public async Task<bool> UpdateAsync(int id, UpdateBookDto dto)
    {
        var book = await _bookRepository.GetByIdWithDetailsAsync(id);
        if (book == null) return false;

        book.Title = dto.Title;
        book.Isbn = dto.Isbn;
        book.PublishedYear = dto.PublishedYear;
        book.CoverImageUrl = dto.CoverImageUrl;
        book.CoverImagePublicId = dto.CoverImagePublicId;
        book.PublisherId = dto.PublisherId;
        book.CategoryId = dto.CategoryId;

        book.BookAuthors.Clear();
        foreach (var authorId in dto.AuthorIds)
            book.BookAuthors.Add(new BookAuthor { BookId = book.Id, AuthorId = authorId });

        _bookRepository.Update(book);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var book = await _bookRepository.GetByIdAsync(id);
        if (book == null) return false;

        _bookRepository.Remove(book);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}
