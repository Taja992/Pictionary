# Deployed at
    https://drawit-459009.web.app/

# Pictionary Game Architecture


```mermaid
flowchart TD
    Client([Client]) --> RESTRoute[REST API Request]
    Client --> WSRoute[WebSocket API Request]
    
    %% REST API Flow
    subgraph "REST API Layer"
        RESTRoute --> RestAPI[Api.Rest]
        RestAPI --> AuthController[AuthController]
        RestAPI --> GameController[GameController]
        RestAPI --> UserController[UserController]
        RestAPI --> LeaderboardController[LeaderboardController]
    end
    
    %% WebSocket API Flow
    subgraph "WebSocket API Layer"
        WSRoute --> WebSocketAPI[Api.WebSocket]
        WebSocketAPI --> DrawEventHandler[DrawEventHandler]
        WebSocketAPI --> GuessEventHandler[GuessEventHandler]
        WebSocketAPI --> GameStateHandler[GameStateHandler]
        WebSocketAPI --> PlayerJoinHandler[PlayerJoinHandler]
    end
    
    %% Application Layer
    subgraph "Application Layer"
        AuthController --> AuthService[AuthService]
        GameController --> GameOrchestrationService[GameOrchestrationService]
        UserController --> UserService[UserService]
        LeaderboardController --> ScoreService[ScoreService]
        
        DrawEventHandler --> DrawingService[DrawingService]
        GuessEventHandler --> GuessValidationService[GuessValidationService]
        GameStateHandler --> GameOrchestrationService
        PlayerJoinHandler --> RoomService[RoomService]
        
        DrawingService --> GameOrchestrationService
        GuessValidationService --> GameOrchestrationService
        GuessValidationService --> ScoreService
        
        %% Services use NotificationService
        GameOrchestrationService --> NotificationService[NotificationService]
        RoomService --> NotificationService
        DrawingService --> NotificationService
        GuessValidationService --> NotificationService
    end
    
    %% Domain Layer
    subgraph "Core Domain Layer"
        GameOrchestrationService --> Game[Game Entity]
        RoomService --> Room[Room Entity]
        UserService --> User[User Entity]
        AuthService --> User
        ScoreService --> Score[Score Entity]
        DrawingService --> Drawing[Drawing Entity]
        GuessValidationService --> Word[Word Entity]
    end
    
    %% Infrastructure Layer
    subgraph "Infrastructure Layer"
        %% Database Access
        Game --> GameRepo[GameRepository]
        Room --> RoomRepo[RoomRepository]
        User --> UserRepo[UserRepository]
        Score --> ScoreRepo[ScoreRepository]
        Drawing --> DrawingRepo[DrawingRepository]
        Word --> WordRepo[WordRepository]
        
        %% WebSocket Connection Management
        NotificationService --> ConnManager[WebSocket ConnectionManager]
        WebSocketAPI <--> ConnManager
        
        %% Group repositories
        GameRepo --> DbContext[Postgres DbContext]
        RoomRepo --> DbContext
        UserRepo --> DbContext
        ScoreRepo --> DbContext
        DrawingRepo --> DbContext
        WordRepo --> DbContext
    end
    
    %% Real-time Communication
    ConnManager --> BroadcastToRoom[Broadcast to Room Players]
    BroadcastToRoom --> Client