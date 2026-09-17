using AutoMapper;
using Application.DTOs.Publisher;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Application.Interfaces;
using Domain.Entities;

namespace Infrastructure.Services;

public class PublisherService : IPublisherService
{
    private readonly IRepository<Publisher> _publisherRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public PublisherService(IRepository<Publisher> publisherRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _publisherRepository = publisherRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<PublisherDto>> GetAllAsync()
    {
        var publishers = await _publisherRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<PublisherDto>>(publishers);
    }

    public async Task<PublisherDto?> GetByIdAsync(int id)
    {
        var publisher = await _publisherRepository.GetByIdAsync(id);
        return publisher == null ? null : _mapper.Map<PublisherDto>(publisher);
    }

    public async Task<PublisherDto> CreateAsync(CreatePublisherDto dto)
    {
        var publisher = _mapper.Map<Publisher>(dto);
        await _publisherRepository.AddAsync(publisher);
        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<PublisherDto>(publisher);
    }

    public async Task<bool> UpdateAsync(int id, UpdatePublisherDto dto)
    {
        var publisher = await _publisherRepository.GetByIdAsync(id);
        if (publisher == null) return false;

        _mapper.Map(dto, publisher);
        _publisherRepository.Update(publisher);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var publisher = await _publisherRepository.GetByIdAsync(id);
        if (publisher == null) return false;

        _publisherRepository.Remove(publisher);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}
