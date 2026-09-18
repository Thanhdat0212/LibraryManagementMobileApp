using Application.Interfaces;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Application.Settings;
using Domain.Entities;
using Infrastructure.Persistence;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Infrastructure.Services.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;



namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
        services.Configure<CloudinarySettings>(configuration.GetSection("Cloudinary"));
        services.Configure<BorrowPolicySettings>(configuration.GetSection("BorrowPolicy"));
        services.Configure<FineSettings>(configuration.GetSection("FineSettings"));

        services.AddScoped<IRepository<Author>, Repository<Author>>();
        services.AddScoped<IRepository<Publisher>, Repository<Publisher>>();
        services.AddScoped<IRepository<Category>, Repository<Category>>();
        services.AddScoped<IRepository<BookAuthor>, Repository<BookAuthor>>();
        services.AddScoped<IBookRepository, BookRepository>();
        services.AddScoped<IBookCopyRepository, BookCopyRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IBorrowRecordRepository, BorrowRecordRepository>();
        services.AddScoped<IBorrowRequestRepository, BorrowRequestRepository>();
        services.AddScoped<IFineRepository, FineRepository>();

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddScoped<IAuthorService, AuthorService>();
        services.AddScoped<IPublisherService, PublisherService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IBookService, BookService>();
        services.AddScoped<IBookCopyService, BookCopyService>();
        services.AddScoped<IBorrowRecordService, BorrowRecordService>();
        services.AddScoped<IBorrowRequestService, BorrowRequestService>();
        services.AddScoped<IFineService, FineService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ICloudinaryService, CloudinaryService>();

        services.AddScoped<PasswordHasher>();
        services.AddScoped<JwtService>();
        var jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>() ?? new JwtSettings();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
                    ClockSkew = TimeSpan.Zero
                };
            });

        services.AddAuthorization();

        return services;
    }
}
