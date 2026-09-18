namespace Infrastructure.Repositories;

using Application.DTOs.Book;
using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;


public class BookRepository : Repository<Book>, IBookRepository
{
    public BookRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Book>> GetAllWithDetailsAsync()
    {
        return await _dbSet
            .Include(b => b.Publisher)
            .Include(b => b.Category)
            .Include(b => b.BookAuthors)
            .ThenInclude(ba => ba.Author)
            .Include(b => b.BookCopies)
            .ToListAsync();
    }

    public async Task<Book?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(b => b.Publisher)
            .Include(b => b.Category)
            .Include(b => b.BookAuthors)
            .ThenInclude(ba => ba.Author)
            .Include(b => b.BookCopies)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<(IEnumerable<Book> Items, int TotalCount)> SearchAsync(BookQueryDto query)
    {
        var q = _dbSet
            .Include(b => b.Publisher)
            .Include(b => b.Category)
            .Include(b => b.BookAuthors)
            .ThenInclude(ba => ba.Author)
            .Include(b => b.BookCopies)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(b => b.Title.ToLower().Contains(term) || b.Isbn.ToLower().Contains(term));
        }

        if (query.CategoryId.HasValue)
            q = q.Where(b => b.CategoryId == query.CategoryId);

        if (query.PublisherId.HasValue)
            q = q.Where(b => b.PublisherId == query.PublisherId);

        if (query.AuthorId.HasValue)
            q = q.Where(b => b.BookAuthors.Any(ba => ba.AuthorId == query.AuthorId));

        if (query.OnlyAvailable)
            q = q.Where(b => b.BookCopies.Any(c => c.Status == BookCopyStatus.Available));

        var totalCount = await q.CountAsync();
        var items = await q
            .OrderBy(b => b.Title)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}
