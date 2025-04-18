using Application.Interfaces.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class TempUserCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TempUserCleanupService> _logger;
    private readonly TimeSpan _cleanupInterval = TimeSpan.FromHours(1); // Run cleanup every hour
    
    public TempUserCleanupService(
        IServiceProvider serviceProvider,
        ILogger<TempUserCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Temporary user cleanup service is starting");
        
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Running temporary user cleanup");
            
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
                await userService.CleanupTemporaryUsersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up temporary users");
            }
            
            // Wait for the next cleanup interval
            await Task.Delay(_cleanupInterval, stoppingToken);
        }
    }
}