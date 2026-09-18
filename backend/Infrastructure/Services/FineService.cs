using Application.DTOs.Fine;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using AutoMapper;
using Domain.Enums;

namespace Infrastructure.Services;

public class FineService : IFineService
{
    private readonly IFineRepository _fineRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public FineService(IFineRepository fineRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _fineRepository = fineRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<FineDto>> GetAllAsync(FineStatus? status)
    {
        var fines = await _fineRepository.GetAllWithDetailsAsync(status);
        return _mapper.Map<IEnumerable<FineDto>>(fines);
    }

    public async Task<IEnumerable<FineDto>> GetByUserIdAsync(int userId)
    {
        var fines = await _fineRepository.GetAllByUserIdAsync(userId);
        return _mapper.Map<IEnumerable<FineDto>>(fines);
    }

    public async Task<FineDto?> GetByIdAsync(int id)
    {
        var fine = await _fineRepository.GetByIdWithDetailsAsync(id);
        return fine == null ? null : _mapper.Map<FineDto>(fine);
    }

    public async Task<FineDto> PayAsync(int id)
    {
        var fine = await _fineRepository.GetByIdWithDetailsAsync(id)
            ?? throw new InvalidOperationException("Không tìm thấy khoản phạt.");

        if (fine.Status == FineStatus.Paid)
            throw new InvalidOperationException("Khoản phạt này đã được thanh toán.");

        fine.Status = FineStatus.Paid;
        fine.PaidAt = DateTime.UtcNow;
        _fineRepository.Update(fine);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<FineDto>(fine);
    }

    public async Task<FineDto> WaiveAsync(int id)
    {
        var fine = await _fineRepository.GetByIdWithDetailsAsync(id)
            ?? throw new InvalidOperationException("Không tìm thấy khoản phạt.");

        if (fine.Status != FineStatus.Unpaid)
            throw new InvalidOperationException("Chỉ có thể miễn khoản phạt đang chưa thanh toán.");

        fine.Status = FineStatus.Waived;
        _fineRepository.Update(fine);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<FineDto>(fine);
    }
}
