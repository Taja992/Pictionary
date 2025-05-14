FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Startup/Startup.csproj", "Startup/"]
COPY ["Application/Application.csproj", "Application/"]
COPY ["Api.Rest/Api.Rest.csproj", "Api.Rest/"]
COPY ["Api.WebSocket/Api.WebSocket.csproj", "Api.WebSocket/"]
COPY ["Infrastructure.Postgres/Infrastructure.Postgres.csproj", "Infrastructure.Postgres/"]
COPY ["Infrastructure.WebSocket/Infrastructure.WebSocket.csproj", "Infrastructure.WebSocket/"]
COPY ["Core.Domain/Core.Domain.csproj", "Core.Domain/"]
RUN dotnet restore "Startup/Startup.csproj"

COPY . .

WORKDIR "/src/Startup"
RUN dotnet build "Startup.csproj" -c Release -o /app/build
RUN dotnet publish "Startup.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Entry point
ENTRYPOINT ["dotnet", "Startup.dll"]