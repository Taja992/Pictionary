# Deployed at
    https://drawit-459009.web.app/

## PostgreSQL Requirement

This application requires PostgreSQL to be running locally for development. The application uses Entity Framework Core migrations to set up and maintain the database schema.

### Prerequisites
- PostgreSQL installed and running on port 5432
- Default credentials: username `postgres`, password `postgres`
- Default database: `postgres`

### Database Connection
The application is configured to connect to a local PostgreSQL instance with these settings:
```
Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=postgres;
```

### Database Migrations
When the application starts, it automatically runs database migrations to ensure the schema is up to date. This happens in the `Program.cs` file:

```csharp
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
```

# Pictionary Game Architecture

The Pictionary game is built with a clean, layered architecture. Below are diagrams showing the overall architecture and key subsystems.

## Server Architecture Overview

```mermaid
flowchart TD
    Client([Client Browser]) --> RESTRoute[REST API Request]
    Client --> WSRoute[WebSocket API Request]
    
    %% Project Structure by Assembly
    subgraph "Api.Rest"
        RESTRoute --> RestControllers[Controllers]
        RestControllers --> GameOrchestriationController[GameOrchestriationController]
        RestControllers --> RoomController[RoomController]
        RestControllers --> UserController[UserController]
    end
    
    subgraph "Api.WebSocket"
        WSRoute --> WebSocketEndpoint["/ws Endpoint"]
        WebSocketEndpoint --> EventHandlers[Event Handlers]
        EventHandlers --> DrawEventHandler[DrawEventHandler]
        EventHandlers --> ChatEventHandler[ChatEventHandler]
        EventHandlers --> RoomEventHandler[RoomEventHandler]
    end
    
    subgraph "Application"
        ApplicationServices[Application Services]
        ApplicationServices --> GameOrchestrationService[GameOrchestrationService]
        ApplicationServices --> RoomService[RoomService]
        ApplicationServices --> UserService[UserService]
        ApplicationServices --> ScoreService[ScoreService]
        ApplicationServices --> WordService[WordService]
    end

    subgraph "Core.Domain"
        Entities[Domain Entities]
        Entities --> Game[Game]
        Entities --> Room[Room]
        Entities --> User[User]
        Entities --> Score[Score]
    end
    
    subgraph "Infrastructure.Postgres"
        RepositoriesImpl[Repository Implementations]
        RepositoriesImpl --> GameRepository[GameRepository]
        RepositoriesImpl --> RoomRepository[RoomRepository]
        RepositoriesImpl --> UserRepository[UserRepository]
        RepositoriesImpl --> ScoreRepository[ScoreRepository]
        
        DbContext[PictionaryDbContext]
    end
    
    subgraph "Infrastructure.WebSocket"
        WSInfrastructure[WebSocket Infrastructure]
        WSInfrastructure --> WebSocketHandler[WebSocketHandler]
        WSInfrastructure --> ConnectionManager[ConnectionManager]
        WSInfrastructure --> MessageRouter[MessageRouter]
        WSInfrastructure --> MessageService[MessageService]
        WSInfrastructure --> NotificationService[NotificationService]
    end
    
    %% Service Dependencies
    GameOrchestriationController --> GameOrchestrationService
    RoomController --> RoomService
    UserController --> UserService
    
    DrawEventHandler --> MessageService
    ChatEventHandler --> GameOrchestrationService
    ChatEventHandler --> ScoreService
    ChatEventHandler --> MessageService
    RoomEventHandler --> RoomService
    RoomEventHandler --> MessageService
    
    GameOrchestrationService --> NotificationService
    RoomService --> NotificationService
    
    %% Infrastructure Dependencies
    WebSocketEndpoint --> WebSocketHandler
    WebSocketHandler --> MessageRouter
    MessageRouter --> EventHandlers
    
    NotificationService --> MessageService
    MessageService --> ConnectionManager
    
    %% Repository Dependencies
    GameOrchestrationService --> GameRepository
    GameOrchestrationService --> RoomRepository
    GameOrchestrationService --> UserRepository
    GameOrchestrationService --> ScoreRepository
    RoomService --> RoomRepository
    RoomService --> UserRepository
    UserService --> UserRepository
    ScoreService --> ScoreRepository
    
    %% Data Access
    RepositoriesImpl --> DbContext
```

## WebSocket Communication Flow

This diagram shows how real-time messages flow through the system:

```mermaid
sequenceDiagram
    participant Client
    participant WebSocketHandler
    participant ConnectionManager
    participant MessageRouter
    participant EventHandlers
    participant ApplicationServices
    participant MessageService
    participant NotificationService
    
    %% Establishing connection
    Client->>WebSocketHandler: Connection Request
    WebSocketHandler->>ConnectionManager: OnOpen(socket, clientId, userId, username)
    ConnectionManager->>ConnectionManager: Track connection
    ConnectionManager-->>WebSocketHandler: Connection established
    
    %% Client message flow
    Client->>WebSocketHandler: Send message
    WebSocketHandler->>MessageRouter: RouteMessage(socket, clientId, message)
    MessageRouter->>MessageRouter: Parse message type
    MessageRouter->>EventHandlers: Call appropriate handler
    EventHandlers->>ApplicationServices: Execute domain logic
    ApplicationServices-->>EventHandlers: Result
    EventHandlers->>MessageService: Send response
    MessageService->>ConnectionManager: Get client connection
    MessageService->>Client: Send response to client
    
    %% Game event notifications
    ApplicationServices->>NotificationService: Notify of game event
    NotificationService->>MessageService: BroadcastToRoom
    MessageService->>ConnectionManager: Get clients in room
    MessageService->>Client: Send notification to clients
```

## Repository Pattern Implementation

This diagram shows how the repository pattern is implemented:

```mermaid
classDiagram
    class BaseRepository~T~ {
        #DbContext _context
        #DbSet~T~ _dbSet
        +GetByIdAsync(id) Task~T?~
        +GetAllAsync() Task~IEnumerable~T~~
        +CreateAsync(entity) Task~string~
        +UpdateAsync(entity) Task
        +DeleteAsync(id) Task
    }
    
    class IGameRepository {
        <<interface>>
        +GetByIdAsync(id) Task~Game?~
        +GetCurrentGameForRoomAsync(roomId) Task~Game?~
        +CreateAsync(game) Task~string~
        +UpdateAsync(game) Task
        +EndGameAsync(gameId, endTime) Task
        +DeleteAsync(id) Task
    }
    
    class GameRepository {
        +GetByIdAsync(id) Task~Game?~
        +GetCurrentGameForRoomAsync(roomId) Task~Game?~
        +CreateAsync(game) Task~string~
        +UpdateAsync(game) Task
        +EndGameAsync(gameId, endTime) Task
    }
    
    class IRoomRepository {
        <<interface>>
        +GetByIdAsync(id) Task~Room?~
        +GetAvailableRoomsAsync() Task~IEnumerable~Room~~
        +GetRoomsByUserIdAsync(userId) Task~IEnumerable~Room~~
        +CreateAsync(room) Task~string~
        +UpdateAsync(room) Task
        +AddPlayerToRoomAsync(roomId, playerId) Task
        +RemovePlayerFromRoomAsync(roomId, playerId) Task
        +DeleteAsync(id) Task
    }
    
    class RoomRepository {
        +GetByIdAsync(id) Task~Room?~
        +GetAvailableRoomsAsync() Task~IEnumerable~Room~~
        +GetRoomsByUserIdAsync(userId) Task~IEnumerable~Room~~
        +CreateAsync(room) Task~string~
        +UpdateAsync(room) Task
        +AddPlayerToRoomAsync(roomId, playerId) Task
        +RemovePlayerFromRoomAsync(roomId, playerId) Task
    }
    
    class PictionaryDbContext {
        +DbSet~User~ Users
        +DbSet~Room~ Rooms
        +DbSet~Game~ Games
        +DbSet~Score~ Scores
    }
    
    BaseRepository <|-- GameRepository
    BaseRepository <|-- RoomRepository
    BaseRepository <|-- UserRepository
    BaseRepository <|-- ScoreRepository
    
    IGameRepository <|.. GameRepository
    IRoomRepository <|.. RoomRepository
    
    GameRepository --> PictionaryDbContext
    RoomRepository --> PictionaryDbContext
    UserRepository --> PictionaryDbContext
    ScoreRepository --> PictionaryDbContext
```

## Real-Time Communication Components

This diagram focuses on the WebSocket infrastructure:

```mermaid
classDiagram
    class IConnectionManager {
        <<interface>>
        +OnOpen(socket, clientId, userId, username) Task
        +OnClose(socket, clientId) Task
        +GetClientIdsForUser(userId) Task~List~string~~
        +AddToRoom(room, clientId) Task
        +RemoveFromRoom(room, clientId) Task
        +GetClientsFromRoomId(room) Task~List~string~~
        +GetRoomsFromClientId(clientId) Task~List~string~~
        +GetSocketFromClientId(clientId) object?
        +GetUserIdFromClientId(clientId) Task~string~
    }
    
    class ConnectionManager {
        -ConcurrentDictionary clientIdToSocket
        -ConcurrentDictionary socketToClientId
        -ConcurrentDictionary roomsToClientId
        -ConcurrentDictionary clientIdToRooms
        -ConcurrentDictionary clientIdToUserId
        -ConcurrentDictionary clientIdToUsername
        -ConcurrentDictionary userIdToClientIds
        +OnOpen(socket, clientId, userId, username) Task
        +OnClose(socket, clientId) Task
        +AddToRoom(room, clientId) Task
        +RemoveFromRoom(room, clientId) Task
        +GetClientsFromRoomId(room) Task~List~string~~
        +GetRoomsFromClientId(clientId) Task~List~string~~
        +GetClientIdsForUser(userId) Task~List~string~~
        +GetSocketFromClientId(clientId) object?
        +GetUserIdFromClientId(clientId) Task~string~
        -LogCurrentState() Task
    }
    
    class IMessageService {
        <<interface>>
        +SendToClient(clientId, message) Task
        +SendToClient~T~(clientId, message) Task
        +BroadcastToRoom(room, message) Task
        +BroadcastToRoom~T~(room, message) Task
    }
    
    class MessageService {
        +SendToClient(clientId, message) Task
        +SendToClient~T~(clientId, message) Task
        +BroadcastToRoom(room, message) Task
        +BroadcastToRoom~T~(room, message) Task
    }
    
    class IMessageRouter {
        <<interface>>
        +RouteMessage(socket, clientId, message) Task
    }
    
    class MessageRouter {
        +RouteMessage(socket, clientId, message) Task
    }
    
    class IWebSocketHandler {
        <<interface>>
        +ProcessWebSocketAsync(context) Task
    }
    
    class WebSocketHandler {
        -ReceiveMessagesAsync(webSocket, clientId) Task
        +ProcessWebSocketAsync(context) Task
    }
    
    IConnectionManager <|.. ConnectionManager
    IMessageService <|.. MessageService
    IMessageRouter <|.. MessageRouter
    IWebSocketHandler <|.. WebSocketHandler
    
    WebSocketHandler --> IConnectionManager
    WebSocketHandler --> IMessageRouter
    MessageService --> IConnectionManager
    MessageRouter --> IDrawEventHandler
    MessageRouter --> IChatEventHandler
    MessageRouter --> IRoomEventHandler
```