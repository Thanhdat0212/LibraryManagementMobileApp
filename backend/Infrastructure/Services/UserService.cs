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

    public async Task<bool> SetLockedAsync(int id, bool isLocked, int currentUserId)
    {
        if (isLocked && id == currentUserId)
            throw new InvalidOperationException("Không thể tự khóa tài khoản của chính mình.");

        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return false;

        // Khóa Admin cuối cùng đang hoạt động sẽ khiến không còn ai đăng nhập được để mở khóa lại.
        if (isLocked && user.Role == UserRole.Admin && !await _userRepository.HasAnotherActiveAdminAsync(id))
            throw new InvalidOperationException("Không thể khóa Admin cuối cùng đang hoạt động trong hệ thống.");

        user.IsLocked = isLocked;
        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}
