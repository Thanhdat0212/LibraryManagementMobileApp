using Application.DTOs.Media;

namespace Application.Interfaces.Services;

public interface ICloudinaryService
{
    CloudinarySignatureDto GenerateUploadSignature(string? folder = null);
    Task<bool> DeleteAsync(string publicId, bool isVideo = false);
}
