using Application.Interfaces.Services;
using Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class ApplicationExtensions
{
    public static void AddApplicationServices(this IServiceCollection services)
    {
        // Register REST API services
        services.AddScoped<IGameOrchestrationService, GameOrchestrationService>();
        services.AddScoped<IRoomService, RoomService>();
        services.AddScoped<IUserService, UserService>();
        services.AddHostedService<TempUserCleanupService>();
        services.AddScoped<IWordService, WordService>();
        services.AddScoped<IScoreService, ScoreService>();

        
    }
}