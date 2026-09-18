using Application.DTOs.User;

namespace Application.Interfaces.Services;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<bool> SetLockedAsync(int id, bool isLocked, int currentUserId);
}
