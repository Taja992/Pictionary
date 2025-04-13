using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;

namespace Api.Rest
{
    public static class RestStartupExtensions
    {
        public static IServiceCollection AddRestApi(this IServiceCollection services)
        {
            services.AddEndpointsApiExplorer();
            
            // Exception handling will be added here when you create the GlobalExceptionHandler
            // services.AddExceptionHandler<GlobalExceptionHandler>();
            services.AddProblemDetails();

            var controllersAssembly = typeof(RestStartupExtensions).Assembly;
            services.AddControllers().AddApplicationPart(controllersAssembly);
            
            return services;
        }

        public static WebApplication UseRestApi(this WebApplication app)
        {
            app.UseExceptionHandler();
            app.MapControllers();
            
            return app;
        }
    }
}