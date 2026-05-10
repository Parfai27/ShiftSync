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
- **Authentication** - Secure login with password management and first-login password change requirement
- **Session Management** - Persistent user sessions with security controls
- **Email Notifications** - Automated credential delivery and system notifications
- **Data Export** - CSV and SVG export capabilities for schedules and reports
- **Responsive Design** - Mobile-friendly interface optimized for all screen sizes
- **Real-time Updates** - Live data synchronization with backend API

## 🛠️ Tech Stack

### Backend
- **Language:** Java 17
- **Framework:** Spring Boot 3.x
- **Database:** JPA/Hibernate (configurable database)
- **Build Tool:** Maven
- **Email:** Spring Mail (SMTP)
- **API:** RESTful API with JSON

### Frontend
- **Framework:** React 18+
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Feather Icons (react-icons)
- **Routing:** React Router v6
- **State Management:** React Hooks
- **HTTP Client:** Native Fetch API

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
- Java 17 or higher
- Node.js 16+ and npm
- Maven 3.6+
- A database (MySQL, PostgreSQL, etc.)
- SMTP server for email notifications (optional)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Configure database connection** in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/shiftsync
   spring.datasource.username=root
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   ```

3. **Configure email (optional)** in `application.properties`:
   ```properties
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your_email@gmail.com
   spring.mail.password=your_app_password
   app.frontend.url=http://localhost:5173
   ```

4. **Build and run:**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   Or use the provided script:
   ```bash
   ./start-backend.cmd
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
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/validate` - Validate session

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
- `GET /api/admin/users` - User management
- `GET /api/admin/audit-logs` - Audit logs
- `POST /api/admin/settings` - System settings

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication (if implemented)
- Role-based access control (RBAC)
- First-login password change requirement
- Session management
- CSRF protection
- Input validation
- SQL injection prevention (via parameterized queries)

## 🗄️ Database Models

### Core Entities
- **User** - System users with roles
- **EmployeeProfile** - Employee information and metadata
- **Shift** - Scheduled work periods
- **ShiftAdjustmentRequest** - Time-off and swap requests
- **Payroll** - Payment records and history
- **Notification** - System notifications
- **AuditLog** - System activity tracking

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

**Last Updated:** May 10, 2026

For the latest updates, visit the [GitHub Repository](https://github.com/Parfai27/ShiftSync)
