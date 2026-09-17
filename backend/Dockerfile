FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .
RUN dotnet restore "API/API.csproj"
RUN dotnet publish "API/API.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
# Render Free tier chỉ có 512MB RAM/0.5 CPU: Server GC (mặc định) đòi hỏi
# 1 heap riêng cho mỗi CPU và có thể làm CLR crash (exit 139) khi RAM quá thấp.
# Workstation GC dùng ít bộ nhớ hơn nhiều, phù hợp container nhỏ.
ENV DOTNET_gcServer=0
EXPOSE 8080

ENTRYPOINT ["dotnet", "API.dll"]
