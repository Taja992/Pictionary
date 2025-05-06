using NSwag;
using NSwag.Generation.Processors.Security;
using Application;
using Api.Rest;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Api.WebSocket;
using Infrastructure.Websocket;
using Infrastructure.Postgres;
using Microsoft.EntityFrameworkCore;



var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Register API services
builder.Services.AddEndpointsApiExplorer();

// Configure CORS for development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowedOrigins", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",          // Local development
                "https://drawit-459009.web.app",  // Firebase primary URL
                "https://drawit-459009.firebaseapp.com")  // Firebase secondary URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();  // Important for cookies/auth
    });
});

string connectionString = builder.Configuration["AppOptions:POSTGRES_CONNECTION_STRING"] ?? "";
string secretPath = "/app/secrets/postgres-connection-string";
if (File.Exists(secretPath))
{
    connectionString = File.ReadAllText(secretPath).Trim();
    builder.Configuration["AppOptions:POSTGRES_CONNECTION_STRING"] = connectionString;
}

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
builder.Services.AddApplicationServices();
builder.Services.AddPostgresInfrastructure(builder.Configuration);
builder.Services.AddWebSocketInfrastructure();
builder.Services.AddRestApi();
builder.Services.AddWebSocketApi();



// Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = appOptions.JwtSettings.Issuer,
        ValidAudience = appOptions.JwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(appOptions.JwtSettings.SecretKey))
    };
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<PictionaryDbContext>();
        Console.WriteLine("Attempting database migration...");
        dbContext.Database.Migrate();
        Console.WriteLine("Database migration completed successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database migration error: {ex.Message}");
    }
}

// Use CORS with the Allowed Origins
app.UseCors("AllowedOrigins");

app.UseWebSockets(new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromSeconds(30) // More frequent keep-alive
});

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
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
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseRestApi();
app.UseWebSocketApi();


app.Run();