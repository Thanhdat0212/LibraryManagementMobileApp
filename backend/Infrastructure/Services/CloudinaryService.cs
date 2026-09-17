using System.Security.Cryptography;
using System.Text;
using Application.DTOs.Media;
using Application.Interfaces.Services;
using Application.Settings;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services;

public class CloudinaryService : ICloudinaryService
{
    private readonly CloudinarySettings _settings;
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IOptions<CloudinarySettings> options)
    {
        _settings = options.Value;
        _cloudinary = new Cloudinary(new Account(_settings.CloudName, _settings.ApiKey, _settings.ApiSecret));
    }

    public CloudinarySignatureDto GenerateUploadSignature(string? folder = null)
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var targetFolder = string.IsNullOrWhiteSpace(folder) ? _settings.UploadFolder : folder;

        var paramsToSign = new SortedDictionary<string, string>
        {
            ["folder"] = targetFolder,
            ["timestamp"] = timestamp.ToString()
        };

        var paramString = string.Join("&", paramsToSign.Select(p => $"{p.Key}={p.Value}"));
        var toSign = paramString + _settings.ApiSecret;
        var hash = SHA1.HashData(Encoding.UTF8.GetBytes(toSign));
        var signature = Convert.ToHexString(hash).ToLowerInvariant();

        return new CloudinarySignatureDto
        {
            Signature = signature,
            Timestamp = timestamp,
            ApiKey = _settings.ApiKey,
            CloudName = _settings.CloudName,
            Folder = targetFolder
        };
    }

    public async Task<bool> DeleteAsync(string publicId, bool isVideo = false)
    {
        var deletionParams = new DeletionParams(publicId)
        {
            ResourceType = isVideo ? ResourceType.Video : ResourceType.Image
        };

        var result = await _cloudinary.DestroyAsync(deletionParams);
        return result.Result == "ok";
    }
}
