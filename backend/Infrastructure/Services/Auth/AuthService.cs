using Application.DTOs.Auth;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Infrastructure.Services.Auth;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly PasswordHasher _passwordHasher;
    private readonly JwtService _jwtService;

    public AuthService(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        PasswordHasher passwordHasher,
        JwtService jwtService)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var email = dto.Email.Trim();
        var existing = await _userRepository.GetByEmailAsync(email);
        if (existing != null)
            throw new InvalidOperationException("Email đã được sử dụng.");

        var user = new User
        {
            FullName = dto.FullName.Trim(),
            Email = email,
            PasswordHash = _passwordHasher.Hash(dto.Password),
            Role = UserRole.Member
        };

        try
        {
            await _userRepository.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueEmailViolation(ex))
        {
            // Race condition: 2 request đăng ký cùng email gửi gần như đồng thời có thể
            // đều qua được check GetByEmailAsync ở trên trước khi request nào SaveChanges.
            // Unique index ở DB sẽ chặn request thứ hai; ở đây quy nó về đúng lỗi nghiệp vụ
            // (400) thay vì để rơi xuống lỗi 500 chung của ExceptionMiddleware.
            throw new InvalidOperationException("Email đã được sử dụng.");
        }

        return new AuthResponseDto
        {
            Token = _jwtService.GenerateToken(user),
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString()
        };
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email.Trim());
        if (user == null || !_passwordHasher.Verify(dto.Password, user.PasswordHash))
            return null;

        return new AuthResponseDto
        {
            Token = _jwtService.GenerateToken(user),
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString()
        };
    }

    private static bool IsUniqueEmailViolation(DbUpdateException ex)
        => ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation };
}
