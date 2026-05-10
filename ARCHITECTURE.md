# ShiftSync System Architecture & Diagrams

Comprehensive architectural documentation and visual diagrams for the ShiftSync workforce management system.

---

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph Client["Client Layer"]
        EB["Employee Browser"]
        MB["Manager Browser"]
        AB["Admin Browser"]
    end
    
    subgraph Frontend["Frontend Application - React + Vite"]
        ER["Employee Portal"]
        MR["Manager Dashboard"]
        AR["Admin Dashboard"]
        LR["Login Page"]
    end
    
    subgraph API["API Gateway & Backend"]
        AUTH["Auth API"]
        EMP["Employee API"]
        MGR["Manager API"]
        ADM["Admin API"]
        NOTIF["Notification Service"]
    end
    
    subgraph Services["Business Logic Services"]
        AUTHSVC["Authentication Service"]
        EMPSVC["Employee Service"]
        SCHDSVC["Scheduling Service"]
        PAYRSVC["Payroll Service"]
        NOTFSVC["Notification Service"]
        MAILSVC["Email Service"]
    end
    
    subgraph Data["Data Layer"]
        DB["PostgreSQL Database"]
        CACHE["Session Cache"]
    end
    
    subgraph External["External Services"]
        SMTP["SMTP Server"]
        FILE["File Storage"]
    end
    
    EB --> LR
    MB --> LR
    AB --> LR
    LR --> AUTH
    ER --> EMP
    ER --> NOTIF
    MR --> MGR
    AR --> ADM
    AUTH --> AUTHSVC
    EMP --> EMPSVC
    MGR --> SCHDSVC
    ADM --> ADM
    EMPSVC --> PAYRSVC
    SCHDSVC --> SCHDSVC
    AUTHSVC --> DB
    EMPSVC --> DB
    SCHDSVC --> DB
    PAYRSVC --> DB
    NOTFSVC --> NOTIF
    MAILSVC --> SMTP
    AUTHSVC --> CACHE
    
    style Client fill:#e1f5ff
    style Frontend fill:#f3e5f5
    style API fill:#fff3e0
    style Services fill:#e8f5e9
    style Data fill:#fce4ec
    style External fill:#f1f8e9
```

---

## 2. Database Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ EMPLOYEE_PROFILE : has
    USER ||--o{ AUDIT_LOG : creates
    USER ||--o{ NOTIFICATION : receives
    EMPLOYEE_PROFILE ||--o{ SHIFT : assigned_to
    EMPLOYEE_PROFILE ||--o{ PAYROLL : has
    EMPLOYEE_PROFILE ||--o{ SHIFT_ADJUSTMENT_REQUEST : creates
    SHIFT ||--o{ SHIFT_ADJUSTMENT_REQUEST : references
    SHIFT ||--o{ ATTENDANCE : records
    MANAGER ||--o{ SHIFT : manages
    MANAGER ||--o{ EMPLOYEE_PROFILE : supervises
    
    USER {
        int userId PK
        string email UK
        string passwordHash
        string role
        boolean active
        boolean mustChangePassword
        timestamp createdAt
        timestamp updatedAt
    }
    
    EMPLOYEE_PROFILE {
        int profileId PK
        int userId FK
        string fullName
        string employeeCode UK
        string jobTitle
        string phoneNumber
        string emergencyContactName
        string emergencyContactPhone
        string profileImageUrl
        date hireDate
        decimal hourlyRate
        boolean hideProfile
        timestamp createdAt
        timestamp updatedAt
    }
    
    SHIFT {
        int shiftId PK
        int assignedEmployeeId FK
        int managerId FK
        string shiftName
        date shiftDate
        time startTime
        time endTime
        string location
        string status
        timestamp createdAt
    }
    
    SHIFT_ADJUSTMENT_REQUEST {
        int adjustmentId PK
        int employeeId FK
        int shiftId FK
        int targetEmployeeId FK
        string adjustmentType
        string status
        string reason
        string peerResponse
        timestamp createdAt
        timestamp respondedAt
    }
    
    PAYROLL {
        int payrollId PK
        int employeeId FK
        date period
        decimal grossAmount
        decimal netAmount
        decimal taxAmount
        decimal regularHours
        decimal overtimeHours
        string depositNote
        timestamp createdAt
    }
    
    NOTIFICATION {
        int notificationId PK
        int userId FK
        string title
        string detail
        string kind
        boolean unread
        timestamp createdAt
    }
    
    ATTENDANCE {
        int attendanceId PK
        int shiftId FK
        time checkInTime
        time checkOutTime
        string status
        timestamp recordedAt
    }
    
    MANAGER {
        int managerId PK
        int userId FK
        string department
        int teamSize
    }
    
    AUDIT_LOG {
        int logId PK
        int userId FK
        string action
        string entityType
        int entityId
        string changes
        timestamp timestamp
    }
```

---

## 3. Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser as Browser
    participant Frontend as Frontend App
    participant Backend as Auth API
    participant Database as Database
    participant Session as Session Store
    
    User->>Browser: Enter credentials
    Browser->>Frontend: Submit login form
    Frontend->>Backend: POST /api/auth/login
    Backend->>Database: Query user by email
    Database-->>Backend: Return user
    Backend->>Backend: Verify password hash
    alt Password Valid
        Backend->>Session: Create session
        Backend-->>Frontend: Return user + token
        Frontend->>Frontend: Save session
        Frontend->>Browser: Redirect to dashboard
        Browser->>User: Show dashboard
    else Password Invalid
        Backend-->>Frontend: Return error 401
        Frontend->>Browser: Show error message
        Browser->>User: Display error
    end
```

---

## 4. Employee Schedule & Adjustment Flow

```mermaid
stateDiagram-v2
    [*] --> ViewSchedule
    
    ViewSchedule --> SelectShift
    SelectShift --> ChooseAdjustment
    
    ChooseAdjustment --> TimeOff
    ChooseAdjustment --> SwapShift
    
    TimeOff --> SubmitTimeOff
    SubmitTimeOff --> ManagerReview
    
    SwapShift --> SelectPeer
    SelectPeer --> SubmitSwapRequest
    SubmitSwapRequest --> PeerReview
    
    PeerReview --> PeerDecision
    PeerDecision --> Accepted: Employee accepts
    PeerDecision --> Rejected: Employee rejects
    
    ManagerReview --> ManagerDecision
    ManagerDecision --> Approved: Manager approves
    ManagerDecision --> Denied: Manager denies
    
    Accepted --> ManagerFinalReview
    ManagerFinalReview --> FinalApproved: Manager approves
    ManagerFinalReview --> FinalDenied: Manager denies
    
    Approved --> [*]
    Denied --> ViewSchedule
    FinalApproved --> [*]
    FinalDenied --> ViewSchedule
    Rejected --> ViewSchedule
```

---

## 5. React Component Architecture

```mermaid
graph TB
    subgraph App["App.jsx - Main Router"]
        Router["React Router Setup"]
    end
    
    subgraph Auth["Auth Pages"]
        Login["login.jsx"]
    end
    
    subgraph Employee["Employee Portal"]
        Dashboard["employee_overview.jsx"]
        Schedule["my_schedule.jsx"]
        Earnings["earnings&pays.jsx"]
        Notifications["notifications.jsx"]
        Profile["profile.jsx"]
        Settings["personal_settings.jsx"]
    end
    
    subgraph Shared["Shared Components"]
        Bell["EmployeeNotificationBell.jsx"]
        ProfileMenu["EmployeeProfileMenu.jsx"]
        ThemeToggle["ThemeToggleButton.jsx"]
    end
    
    subgraph Lib["Utility Libraries"]
        API["api.js - HTTP Client"]
        Session["session.js - Storage"]
        Export["export.js - Export Tools"]
        Theme["theme-context.js"]
    end
    
    Router --> Login
    Router --> Dashboard
    Router --> Schedule
    Router --> Earnings
    Router --> Notifications
    Router --> Profile
    Router --> Settings
    
    Dashboard --> Bell
    Dashboard --> ProfileMenu
    Dashboard --> ThemeToggle
    Schedule --> Bell
    Schedule --> ProfileMenu
    Earnings --> Bell
    Earnings --> ProfileMenu
    Notifications --> Bell
    Notifications --> ProfileMenu
    Profile --> Bell
    Profile --> ProfileMenu
    Settings --> Bell
    Settings --> ProfileMenu
    
    Dashboard --> API
    Dashboard --> Session
    Schedule --> API
    Schedule --> Session
    Schedule --> Export
    Earnings --> API
    Earnings --> Export
    Notifications --> API
    Profile --> API
    Profile --> Session
    Settings --> API
    Settings --> Session
    
    Dashboard --> Theme
    Schedule --> Theme
    Earnings --> Theme
    Notifications --> Theme
    Profile --> Theme
    Settings --> Theme
    
    style App fill:#fff3e0
    style Auth fill:#f3e5f5
    style Employee fill:#e1f5ff
    style Shared fill:#e8f5e9
    style Lib fill:#fce4ec
```

---

## 6. API Endpoint Architecture

```mermaid
graph TB
    subgraph AuthAPI["Authentication API"]
        A1["POST /api/auth/login"]
        A2["POST /api/auth/change-password"]
        A3["GET /api/auth/validate"]
    end
    
    subgraph EmployeeAPI["Employee API"]
        E1["GET /api/employee/dashboard/:userId"]
        E2["GET /api/employee/schedule/:userId"]
        E3["GET /api/employee/earnings/:userId"]
        E4["GET /api/employee/notifications/:userId"]
        E5["GET /api/employee/profile/:userId"]
        E6["GET /api/employee/settings/:userId"]
        E7["POST /api/employee/adjustments/:userId"]
        E8["POST /api/employee/time-off/:userId"]
        E9["POST /api/employee/contact-manager/:userId"]
    end
    
    subgraph ManagerAPI["Manager API"]
        M1["GET /api/manager/dashboard"]
        M2["GET /api/manager/team/:managerId"]
        M3["POST /api/manager/schedule"]
        M4["GET /api/manager/reports"]
        M5["POST /api/manager/announcements"]
    end
    
    subgraph AdminAPI["Admin API"]
        D1["GET /api/admin/users"]
        D2["GET /api/admin/audit-logs"]
        D3["POST /api/admin/settings"]
    end
    
    subgraph Services["Backend Services"]
        AUTHSVC["AuthService"]
        EMPSVC["EmployeeService"]
        SCHDSVC["SchedulingService"]
        PAYRSVC["PayrollService"]
        NOTFSVC["NotificationService"]
    end
    
    A1 --> AUTHSVC
    A2 --> AUTHSVC
    A3 --> AUTHSVC
    
    E1 --> EMPSVC
    E2 --> SCHDSVC
    E3 --> PAYRSVC
    E4 --> NOTFSVC
    E5 --> EMPSVC
    E6 --> EMPSVC
    E7 --> SCHDSVC
    E8 --> SCHDSVC
    E9 --> NOTFSVC
    
    M1 --> EMPSVC
    M2 --> EMPSVC
    M3 --> SCHDSVC
    M4 --> EMPSVC
    M5 --> NOTFSVC
    
    D1 --> AUTHSVC
    D2 --> AUTHSVC
    D3 --> AUTHSVC
    
    style AuthAPI fill:#ffebee
    style EmployeeAPI fill:#e3f2fd
    style ManagerAPI fill:#f3e5f5
    style AdminAPI fill:#fff3e0
    style Services fill:#e8f5e9
```

---

## 7. Data Flow: Employee Schedule Update

```mermaid
graph LR
    E["Employee<br/>Requests Schedule"]
    
    E -->|1. GET /api/employee/schedule/:id| API["API Gateway"]
    
    API -->|2. findByUserId| REPO["ScheduleRepository"]
    
    REPO -->|3. Query| DB["Database"]
    
    DB -->|4. Return Shifts| REPO
    
    REPO -->|5. Raw Data| SVC["SchedulingService"]
    
    SVC -->|6. Transform| DTO["ScheduleDTO"]
    
    DTO -->|7. JSON Response| API
    
    API -->|8. Receive Data| FRONTEND["React Component"]
    
    FRONTEND -->|9. Parse| STATE["useState Hook"]
    
    STATE -->|10. Render| UI["Calendar View"]
    
    UI -->|11. Display| BROWSER["Employee Browser"]
    
    style E fill:#e1f5ff
    style API fill:#fff3e0
    style REPO fill:#fce4ec
    style DB fill:#f1f8e9
    style SVC fill:#e8f5e9
    style DTO fill:#f3e5f5
    style FRONTEND fill:#ffe0b2
    style STATE fill:#c8e6c9
    style UI fill:#b3e5fc
    style BROWSER fill:#81d4fa
```

---

## 8. Deployment Architecture

```mermaid
graph TB
    subgraph Local["Development Environment"]
        LFRONTEND["Frontend Dev Server<br/>Port 5173"]
        LBACKEND["Backend Spring Boot<br/>Port 8080"]
        LMYSQL["Local MySQL<br/>Port 3306"]
    end
    
    subgraph Production["Production Environment"]
        CDN["CDN<br/>Static Assets"]
        FRONTENDAPP["Frontend App<br/>Nginx"]
        BACKENDAPP["Backend Server<br/>Java Application"]
        PRODDB["Production Database<br/>PostgreSQL"]
        REDIS["Redis Cache<br/>Sessions"]
    end
    
    subgraph External["External Services"]
        GITHUB["GitHub Repository"]
        SMTP["Email Service<br/>SMTP"]
        CLOUDFLARE["Cloudflare/CDN"]
    end
    
    LFRONTEND -->|npm run dev| LBACKEND
    LBACKEND -->|JDBC| LMYSQL
    
    GITHUB -->|CI/CD| FRONTENDAPP
    GITHUB -->|CI/CD| BACKENDAPP
    
    FRONTENDAPP --> CDN
    CDN --> CLOUDFLARE
    FRONTENDAPP -->|API Calls| BACKENDAPP
    BACKENDAPP -->|SQL| PRODDB
    BACKENDAPP -->|Cache| REDIS
    BACKENDAPP -->|SMTP| SMTP
    
    style Local fill:#e1f5ff
    style Production fill:#f3e5f5
    style External fill:#fff3e0
```

---

## 9. User Role & Permission Matrix

```mermaid
graph TB
    subgraph Permissions["Access Control"]
        EMP["EMPLOYEE<br/>━━━━━━━━━"]
        MGR["MANAGER<br/>━━━━━━━━━"]
        ADM["ADMIN<br/>━━━━━━━━━"]
    end
    
    subgraph Features["System Features"]
        F1["View Own Schedule"]
        F2["Request Time Off"]
        F3["Swap Shifts"]
        F4["View Earnings"]
        F5["Edit Profile"]
        F6["View Team Schedule"]
        F7["Manage Team"]
        F8["Create Schedules"]
        F9["Approve Adjustments"]
        F10["View Reports"]
        F11["Manage Users"]
        F12["System Settings"]
        F13["Audit Logs"]
        F14["Payroll Management"]
    end
    
    EMP --> F1
    EMP --> F2
    EMP --> F3
    EMP --> F4
    EMP --> F5
    
    MGR --> F1
    MGR --> F2
    MGR --> F3
    MGR --> F4
    MGR --> F5
    MGR --> F6
    MGR --> F7
    MGR --> F8
    MGR --> F9
    MGR --> F10
    MGR --> F14
    
    ADM --> F1
    ADM --> F2
    ADM --> F3
    ADM --> F4
    ADM --> F5
    ADM --> F6
    ADM --> F7
    ADM --> F8
    ADM --> F9
    ADM --> F10
    ADM --> F11
    ADM --> F12
    ADM --> F13
    ADM --> F14
    
    style Permissions fill:#f3e5f5
    style Features fill:#e3f2fd
    style EMP fill:#81c784
    style MGR fill:#64b5f6
    style ADM fill:#ff6e40
```

---

## 10. Request Response Lifecycle

```mermaid
sequenceDiagram
    participant Frontend as React App
    participant Network as Network
    participant Controller as Controller
    participant Service as Business Service
    participant Repository as Database Layer
    participant DB as PostgreSQL
    
    Frontend->>Network: HTTP Request + Headers
    Network->>Controller: Receives Request
    Controller->>Controller: Validate Input
    Controller->>Service: Call Service Method
    Service->>Service: Business Logic
    Service->>Repository: Data Operation
    Repository->>DB: SQL Query
    DB-->>Repository: Result Set
    Repository-->>Service: Entity Objects
    Service-->>Controller: Result/DTO
    Controller->>Controller: Map to Response
    Controller-->>Network: HTTP Response + JSON
    Network-->>Frontend: Response Data
    Frontend->>Frontend: Parse JSON
    Frontend->>Frontend: Update State
    Frontend->>Frontend: Re-render UI
```

---

## 11. Technology Stack Diagram

```mermaid
graph TB
    subgraph Frontend["Frontend Stack"]
        REACT["React 18+"]
        VITE["Vite"]
        TAILWIND["Tailwind CSS"]
        ROUTER["React Router v6"]
        HOOKS["React Hooks"]
        ICONS["Feather Icons"]
    end
    
    subgraph Backend["Backend Stack"]
        SPRING["Spring Boot 3.x"]
        JAVA["Java 17+"]
        JPA["Spring Data JPA"]
        HIBERNATE["Hibernate ORM"]
        VALIDATION["Spring Validation"]
        SECURITY["Spring Security"]
    end
    
    subgraph Database["Database Stack"]
        SQL["SQL Databases"]
        MYSQL["MySQL"]
        POSTGRES["PostgreSQL"]
        MONGO["MongoDB (Optional)"]
    end
    
    subgraph DevOps["DevOps & Tools"]
        MAVEN["Maven"]
        NPM["NPM"]
        GIT["Git"]
        GITHUB["GitHub"]
        DOCKER["Docker (Optional)"]
    end
    
    REACT --> VITE
    VITE --> TAILWIND
    REACT --> ROUTER
    REACT --> HOOKS
    REACT --> ICONS
    
    SPRING --> JAVA
    SPRING --> JPA
    SPRING --> HIBERNATE
    SPRING --> VALIDATION
    SPRING --> SECURITY
    
    JPA --> HIBERNATE
    HIBERNATE --> SQL
    SQL --> MYSQL
    SQL --> POSTGRES
    SQL --> MONGO
    
    JAVA --> MAVEN
    REACT --> NPM
    MAVEN --> GIT
    NPM --> GIT
    GIT --> GITHUB
    GITHUB --> DOCKER
    
    style Frontend fill:#f3e5f5
    style Backend fill:#fff3e0
    style Database fill:#fce4ec
    style DevOps fill:#e8f5e9
```

---

## 12. Session Management Flow

```mermaid
graph LR
    A["User Logs In"] 
    B["Backend Creates Session"]
    C["Session Stored in Cache/DB"]
    D["Token/Session ID Returned"]
    E["Frontend Stores in LocalStorage"]
    F["Sent with Each Request"]
    G["Backend Validates Session"]
    H["Access Granted/Denied"]
    I["Session Expires or Logout"]
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H -->|Valid| F
    H -->|Invalid| A
    I --> A
    
    style A fill:#81c784
    style B fill:#64b5f6
    style C fill:#ffa726
    style D fill:#ba68c8
    style E fill:#29b6f6
    style F fill:#26c6da
    style G fill:#ab47bc
    style H fill:#ef5350
    style I fill:#ec407a
```

---

## Key Architectural Principles

### 1. **Separation of Concerns**
- Frontend handles UI/UX
- Backend handles business logic
- Database handles data persistence
- Services handle external integrations

### 2. **RESTful API Design**
- Standard HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Resource-based endpoints
- JSON request/response format
- Proper HTTP status codes

### 3. **Security**
- Password hashing with bcrypt
- Session-based authentication
- Role-based access control (RBAC)
- Input validation on both frontend and backend
- CSRF protection

### 4. **Scalability**
- Stateless API design
- Caching strategies
- Database indexing
- Load balancing ready

### 5. **Maintainability**
- Clear code organization
- Consistent naming conventions
- Comprehensive documentation
- Modular component structure

### 6. **Performance**
- Frontend lazy loading
- Backend query optimization
- Caching mechanisms
- Efficient data serialization

---

## Database Scaling Strategy

```mermaid
graph TB
    subgraph Current["Current Single Database"]
        PRIMARY["Primary PostgreSQL"]
    end
    
    subgraph Future["Future Scalable Setup"]
        MASTER["Master Database"]
        READ1["Read Replica 1"]
        READ2["Read Replica 2"]
        CACHE["Redis Cache Layer"]
        BACKUP["Backup Database"]
    end
    
    PRIMARY -.->|Upgrade Path| MASTER
    MASTER --> READ1
    MASTER --> READ2
    MASTER --> CACHE
    MASTER --> BACKUP
    
    style Current fill:#ffebee
    style Future fill:#e8f5e9
```

---

## Monitoring & Logging Strategy

```mermaid
graph TB
    subgraph Sources["Log Sources"]
        APP["Application Logs"]
        DB["Database Logs"]
        API["API Request Logs"]
        ERROR["Error Logs"]
    end
    
    subgraph Collection["Log Collection"]
        ELK["ELK Stack"]
        SPLUNK["Splunk"]
    end
    
    subgraph Visualization["Visualization & Alerts"]
        KIBANA["Kibana Dashboards"]
        ALERTS["Alert Rules"]
        REPORTS["Reports"]
    end
    
    APP --> ELK
    DB --> ELK
    API --> ELK
    ERROR --> ELK
    
    ELK --> KIBANA
    ELK --> ALERTS
    ELK --> REPORTS
    
    ALERTS -.->|Notify| TEAM["Development Team"]
    
    style Sources fill:#fff3e0
    style Collection fill:#e8f5e9
    style Visualization fill:#f3e5f5
```

---

**Last Updated:** May 10, 2026
**Version:** 1.0.0

For more information, refer to the main [README.md](./README.md)
