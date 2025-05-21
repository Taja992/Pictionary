using Application.Interfaces.Repositories;
using Infrastructure.Postgres.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Postgres;

public static class PostgresExtensions
{
    public static void AddPostgresInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetSection("AppOptions")["POSTGRES_CONNECTION_STRING"];
        
        services.AddDbContext<PictionaryDbContext>(options =>
            options.UseNpgsql(connectionString));
        
        // Register repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoomRepository, RoomRepository>();
        services.AddScoped<IGameRepository, GameRepository>();
        services.AddScoped<IScoreRepository, ScoreRepository>();
    }
}