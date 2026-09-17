using API.Middlewares;
using Application;
using Domain.Entities;
using Domain.Enums;
using Infrastructure;
using Infrastructure.Persistence;
using Infrastructure.Services.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Swagger chỉ cần thiết ở Development; đăng ký ở Production tốn thêm bộ nhớ
// khởi động (Swashbuckle phải reflect toàn bộ DTO) mà không dùng tới.
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "Library Management API", Version = "v1" });
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Nhập JWT token (không cần tiền tố 'Bearer ')"
        });
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                },
                Array.Empty<string>()
            }
        });
    });
}

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Cho phép frontend gọi API từ origin khác. Danh sách origin đọc từ config
// (appsettings.json cho local dev, biến môi trường "AllowedOrigins__0", "AllowedOrigins__1", ... cho production).
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://127.0.0.1:5173" };

const string FrontendCorsPolicy = "FrontendCorsPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddHealthChecks();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Bỏ qua ép HTTPS ở Development: thiết bị di động (Expo Go) không tin cậy
// chứng chỉ dev tự ký, nên chuyển hướng sẽ khiến request bị lỗi SSL.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseExceptionMiddleware();

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    var adminEmail = builder.Configuration["AdminSeed:Email"];
    var adminPassword = builder.Configuration["AdminSeed:Password"];
    if (!string.IsNullOrEmpty(adminEmail) && !string.IsNullOrEmpty(adminPassword) && !db.Users.Any(u => u.Role == UserRole.Admin))
    {
        var hasher = scope.ServiceProvider.GetRequiredService<PasswordHasher>();
        db.Users.Add(new User
        {
            FullName = "Admin",
            Email = adminEmail,
            PasswordHash = hasher.Hash(adminPassword),
            Role = UserRole.Admin
        });
        db.SaveChanges();
    }
}

app.Run();
