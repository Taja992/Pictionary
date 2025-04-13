using NSwag;
using NSwag.Generation.Processors.Security;
using Microsoft.Extensions.Options;
using Application.Models;
using Application;
using Api.Rest;
using NSwag.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Register API services
builder.Services.AddEndpointsApiExplorer();

// Configure CORS for development
builder.Services.AddCors(options =>
{
    options.AddPolicy("Development", policy =>
    {
        policy.WithOrigins("http://localhost:5173")  // Default Vite dev server port
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();  // Important for cookies/auth
    });
});

// Register AppOptions
var appOptions = builder.Services.AddAppOptions(builder.Configuration);

// Configure OpenAPI/Swagger using NSwag
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "Pictionary Game API";
    config.Version = "v1";
    config.Description = "REST API for the Pictionary game";
    
    // Add JWT security definition
    config.AddSecurity("JWT", new OpenApiSecurityScheme
    {
        Type = OpenApiSecuritySchemeType.ApiKey,
        Name = "Authorization",
        In = OpenApiSecurityApiKeyLocation.Header,
        Description = "Enter 'Bearer {your_token}' in the text box below."
    });
    
    config.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("JWT"));
});

// Add services from your other projects
// builder.Services.AddApplicationServices();
// builder.Services.AddPostgresInfrastructure(builder.Configuration);
// builder.Services.AddWebSocketInfrastructure();
builder.Services.AddRestApi();
// builder.Services.AddWebSocketApi();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    
    // Use CORS with the development policy
    app.UseCors("Development");
    
    // Enable OpenAPI and Swagger UI
    app.UseOpenApi();
    app.UseSwaggerUi();
}
else
{
    // For production
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

// Configure WebSockets
// app.UseWebSockets(new WebSocketOptions
// {
//     KeepAliveInterval = TimeSpan.FromMinutes(2)
// });
app.UseRestApi();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();


// Add WebSocket pipeline
// app.UseWebSocketApi();

app.Run();