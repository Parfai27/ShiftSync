# ShiftSync - Workforce Management System

A comprehensive workforce management platform designed to streamline employee scheduling, payroll management, and communication for pharmacy and retail teams.

## 🎯 Features

### Employee Portal
- **Dashboard Overview** - Real-time view of assigned shifts, earnings, and notifications
- **Schedule Management** - Interactive calendar with shift assignments, time-off requests, and shift swaps
- **Earnings & Payroll** - View payslips, hourly breakdowns, tax estimates, and export payroll history
- **Notifications** - Comprehensive notification center with filtering by category (schedule, payroll, system)
- **Personal Settings** - Manage availability, notification preferences, and profile information
- **Profile Management** - Edit personal information, emergency contacts, and account settings

### Manager Dashboard
- **Team Workspace** - Overview of team schedules and performance metrics
- **Employee Management** - Monitor employee profiles and manage team members
- **Scheduling** - Create and manage shift assignments and handle adjustment requests
- **Payroll** - Review and process employee payments
- **Communication** - Send announcements and direct messages to employees
- **Reports** - Generate audit logs and compliance reports
- **System Settings** - Configure system preferences and security settings

### System Features
- **Authentication** - JWT Bearer tokens with BCrypt password hashing and role-based API access
- **Session Management** - Client-side session storage with idle timeout; server validates JWT on every request
- **Email Notifications** - Automated credential delivery and system notifications
- **Data Export** - CSV, JSON, and SVG export capabilities with customizable export picker modal; profile and report exports
- **Chatbot Assistant** - Integrated ShiftSync Assistant with knowledge base for system help and guidance
- **Admin Workspace** - Centralized admin dashboard with settings, user management, and system configuration
- **Responsive Design** - Mobile-friendly interface optimized for all screen sizes including mobile admin menu

## 🛠️ Tech Stack

### Backend
- **Language:** Java 21
- **Framework:** Spring Boot 3.3
- **Database:** PostgreSQL with Spring Data JPA / Hibernate
- **Security:** Spring Security + JWT (jjwt)
- **Build Tool:** Maven
- **Email:** Spring Mail (SMTP)
- **API:** RESTful JSON API with OpenAPI / Swagger UI

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4
- **Icons:** Feather Icons (react-icons)
- **Routing:** React Router v7
- **State Management:** React Hooks
- **HTTP Client:** Native Fetch API with Bearer token injection

## 📁 Project Structure

```
ShiftSync/
├── backend/
│   ├── src/main/java/com/shiftsync/backend/
│   │   ├── config/              # Configuration classes
│   │   ├── controller/          # REST API endpoints
│   │   ├── dto/                 # Data transfer objects
│   │   ├── model/               # Entity models
│   │   ├── repository/          # Data access layer
│   │   ├── service/             # Business logic
│   │   └── ShiftSyncBackendApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml                  # Maven dependencies
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Employee/        # Employee portal pages
│   │   │   ├── Dashboard/       # Manager dashboard pages
│   │   │   ├── Admin/           # Admin pages
│   │   │   └── shared/          # Reusable components
│   │   ├── lib/                 # Utility functions
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── README.md
│
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites
- Java 21 (JDK)
- Node.js 18+ and npm
- Maven 3.9+
- PostgreSQL 14+
- SMTP server for email notifications (optional)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create the PostgreSQL database:**
   ```sql
   CREATE DATABASE shiftsync;
   ```

3. **Configure environment variables** (or edit `src/main/resources/application.properties`):
   ```powershell
   $env:SHIFT_SYNC_DB_URL="jdbc:postgresql://localhost:5432/shiftsync"
   $env:SHIFT_SYNC_DB_USERNAME="postgres"
   $env:SHIFT_SYNC_DB_PASSWORD="your_password"
   $env:SHIFT_SYNC_JWT_SECRET="use-a-long-random-secret-at-least-32-characters"
   ```

4. **Configure email (optional):**
   ```powershell
   $env:SHIFT_SYNC_MAIL_USERNAME="your_email@gmail.com"
   $env:SHIFT_SYNC_MAIL_PASSWORD="your_app_password"
   $env:SHIFT_SYNC_FRONTEND_URL="http://localhost:5173"
   ```

5. **Build and run:**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   Or use the provided script:
   ```bash
   backend\start-backend.cmd
   ```

   Backend runs on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend runs on `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login (returns JWT)
- `POST /api/auth/change-password` - Change password (authenticated)
- `GET /api/auth/validate` - Validate Bearer token

### Employee Endpoints
- `GET /api/employee/dashboard/{userId}` - Dashboard overview
- `GET /api/employee/schedule/{userId}` - Schedule and calendar
- `GET /api/employee/earnings/{userId}` - Payroll and earnings
- `GET /api/employee/notifications/{userId}` - Notifications
- `GET /api/employee/profile/{userId}` - Employee profile
- `GET /api/employee/settings/{userId}` - Settings
- `POST /api/employee/adjustments/{userId}` - Submit shift adjustments
- `POST /api/employee/time-off/{userId}` - Request time off
- `POST /api/employee/contact-manager/{userId}` - Message manager

### Manager Endpoints
- `GET /api/manager/dashboard` - Manager dashboard
- `GET /api/manager/team/{managerId}` - Team overview
- `POST /api/manager/schedule` - Create schedules
- `GET /api/manager/reports` - Generate reports
- `POST /api/manager/announcements` - Send announcements

### Admin Endpoints
- `GET /api/admin/users` - User management and employee roster
- `GET /api/admin/audit-logs` - Audit logs and system activity
- `GET /api/admin/settings` - Retrieve system settings
- `POST /api/admin/settings` - Update system settings
- `GET /api/admin/system-overview` - System health and metrics

### Chat/Chatbot Endpoints
- `POST /api/chat/message` - Send message to chatbot
- `POST /api/chat/query` - Query chatbot knowledge base
- `GET /api/chat/history/{userId}` - Retrieve chat history

## 🔐 Security Features

- Password hashing with BCrypt
- JWT Bearer token authentication (stateless API)
- Role-based access control (RBAC) on admin and manager endpoints
- `@PreAuthorize` enforcement on admin and manager controllers
- First-login password change requirement
- Client-side session timeout with server-side token validation
- Input validation on DTOs
- SQL injection prevention via parameterized JPA queries

## 🗄️ Database Models

### Core Entities
- **User** - System users with roles
- **EmployeeProfile** - Employee information and metadata
- **Shift** - Scheduled work periods
- **ShiftAssignment** - Shift assignments to employees
- **ShiftAdjustmentRequest** - Time-off and swap requests
- **Payroll** - Payment records and history
- **Notification** - System notifications
- **AuditLog** - System activity tracking
- **SystemSetting** - Configurable system parameters
- **Availability** - Employee availability tracking
- **PayrollRecord** - Detailed payroll transaction records

## 📝 User Roles

1. **Employee** - Can view personal schedule, earnings, and request adjustments
2. **Manager** - Can manage team schedules, payroll, and communications
3. **Admin** - Full system access including user management and settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For issues and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation in individual component READMEs

## 🔄 Recent Updates

### Version 1.1.0 (June 2026)
- ✅ ShiftSync Chatbot Assistant with knowledge base
- ✅ Enhanced admin workspace and settings management
- ✅ Improved export picker modal with multiple format options
- ✅ Profile and report export utilities
- ✅ System settings management with configurable parameters
- ✅ Enhanced JWT authentication and session management
- ✅ Mobile admin menu for responsive admin access

### Version 1.0.0
- ✅ Employee dashboard with real-time data
- ✅ Payroll management system
- ✅ Scheduling with shift swaps
- ✅ Notifications system
- ✅ Profile and settings management
- ✅ Email credential delivery
- ✅ Export functionality (CSV, SVG)
- ✅ Responsive mobile design

## 🚧 Roadmap

- [x] Chatbot Assistant with knowledge base
- [x] Admin workspace and system settings
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and forecasting
- [ ] Biometric time tracking
- [ ] SMS notifications
- [ ] Performance review system
- [ ] Training management
- [ ] Holiday management system
- [ ] Integration with third-party payroll systems

## 📞 Contact

**Project Lead:** ShiftSync Development Team

**Email:** support@shiftsync.local

---

**Last Updated:** June 8, 2026

For the latest updates, visit the [GitHub Repository](https://github.com/Parfai27/ShiftSync)
