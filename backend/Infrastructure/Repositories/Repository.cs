namespace Infrastructure.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Application.Interfaces.Repositories;


public class Repository<T> : IRepository<T> where T : class
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task AddAsync(T entity)
    => await _dbSet.AddAsync(entity);

    public async Task<IEnumerable<T>> GetAllAsync()
    => await _dbSet.ToListAsync();

    public async Task<int> CountAsync()
    => await _dbSet.CountAsync();

    public async Task<T?> GetByIdAsync(int id)
    => await _dbSet.FindAsync(id);

    public void Remove(T entity)
    => _dbSet.Remove(entity);

    public void Update(T entity)
    => _dbSet.Update(entity);
}
