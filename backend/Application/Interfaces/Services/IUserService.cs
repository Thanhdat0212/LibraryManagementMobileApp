using Application.DTOs.User;

namespace Application.Interfaces.Services;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync();
}
