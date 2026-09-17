using Application.DTOs.Auth;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain.Entities;
using Domain.Enums;

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
        var existing = await _userRepository.GetByEmailAsync(dto.Email);
        if (existing != null)
            throw new InvalidOperationException("Email đã được sử dụng.");

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = _passwordHasher.Hash(dto.Password),
            Role = UserRole.Member
        };

        await _userRepository.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

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
        var user = await _userRepository.GetByEmailAsync(dto.Email);
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
}
