using Application.DTOs.User;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using AutoMapper;
using Domain.Enums;

namespace Infrastructure.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UserService(IUserRepository userRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<bool> SetLockedAsync(int id, bool isLocked)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return false;

        user.IsLocked = isLocked;
        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ChangeRoleAsync(int id, UpdateUserRoleDto dto)
    {
        if (!Enum.TryParse<UserRole>(dto.Role, out var role))
            throw new InvalidOperationException("Vai trò không hợp lệ.");

        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return false;

        user.Role = role;
        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}
