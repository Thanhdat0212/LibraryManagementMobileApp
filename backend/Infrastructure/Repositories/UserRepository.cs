using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;


namespace Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        // So khớp không phân biệt hoa/thường: "Test@gmail.com" và "test@gmail.com"
        // phải được coi là cùng một email để chặn trùng lặp khi đăng ký/đăng nhập.
        var normalized = email.Trim().ToLower();
        return await _dbSet.FirstOrDefaultAsync(u => u.Email.ToLower() == normalized);
    }
}