using Application.Interfaces.WebsocketInterfaces;
using Application.Models;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.WebSocket.Services;

public class ConnectionMonitorService : BackgroundService
{
    private readonly IConnectionManager _connectionManager;
    private readonly ILogger<ConnectionMonitorService> _logger;
    private readonly TimeSpan _checkInterval;


    public ConnectionMonitorService(IConnectionManager connectionManager, ILogger<ConnectionMonitorService> logger, 
        IOptions<AppOptions> options)
    {
        _connectionManager = connectionManager;
        _logger = logger;
        _checkInterval = TimeSpan.FromMinutes(options.Value.WebSocket.MonitorCheckIntervalMinutes);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogDebug("Running connection monitor check");

                await _connectionManager.CleanupStaleConnections();

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during connection monitor check");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }
    }
}