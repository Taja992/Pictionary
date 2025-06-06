using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;
using System.Reflection;


namespace Api.Rest
{
    public static class RestStartupExtensions
    {
        public static void AddRestApi(this IServiceCollection services)
        {
            services.AddEndpointsApiExplorer();
            services.AddProblemDetails();
            services.AddAutoMapper(Assembly.GetExecutingAssembly());
            
            var controllersAssembly = typeof(RestStartupExtensions).Assembly;
            services.AddControllers().AddApplicationPart(controllersAssembly);
        }

        public static void UseRestApi(this WebApplication app)
        {
            app.UseExceptionHandler();
            app.MapControllers();
        }
    }
}