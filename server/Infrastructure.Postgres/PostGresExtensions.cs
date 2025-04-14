using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Application.Models;

namespace Infrastructure.Postgres;

public static class PostgresExtensions
{
    public static IServiceCollection AddPostgresInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetSection("AppOptions")["POSTGRES_CONNECTION_STRING"];
        
        services.AddDbContext<PictionaryDbContext>(options =>
            options.UseNpgsql(connectionString));
        
        // Register repositories here when you create them
        // services.AddScoped<IGameRepository, GameRepository>();
        // services.AddScoped<IUserRepository, UserRepository>();
        // etc.
        
        return services;
    }
}