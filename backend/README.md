# ShiftSync Backend

Spring Boot backend for the ShiftSync frontend, aligned to the pharmacy scheduling concept for Ngabo Pharmacy.

## Stack

- Java 21
- Spring Boot 3.3
- Spring Web
- Spring Data JPA
- Spring Security with JWT (stateless Bearer tokens)
- PostgreSQL
- Lombok
- OpenAPI / Swagger UI

## Feature Coverage

The backend structure mirrors the current frontend modules without changing the UI:

- login and user roles
- dashboard overview
- employee profiles and user management
- shift scheduling
- shift adjustments
- notifications and announcements
- compliance and policy management
- reports and payroll-ready data
- manager and admin settings
- audit logs

## Pharmacy Alignment

The backend is modeled for a pharmacy operation such as Ngabo Pharmacy:

- branch entity supports pharmacy branches
- seeded sample data uses `Ngabo Pharmacy - Main Branch`
- compliance and announcements are phrased around pharmacy workflows
- scheduling remains generic enough to match the existing frontend screens

## Project Structure

```text
backend/
  pom.xml
  src/main/java/com/shiftsync/backend
    config/
    controller/
    dto/
    model/
    repository/
    service/
  src/main/resources/application.properties
```

## Database Setup

Create a PostgreSQL database named `shiftsync`.

Example:

```sql
CREATE DATABASE shiftsync;
```

## Configuration

The application reads these environment variables, with local defaults if not provided:

```powershell
$env:SHIFT_SYNC_DB_URL="jdbc:postgresql://localhost:5432/shiftsync"
$env:SHIFT_SYNC_DB_USERNAME="postgres"
$env:SHIFT_SYNC_DB_PASSWORD="your_password"
$env:SHIFT_SYNC_SERVER_PORT="8080"
$env:SHIFT_SYNC_JWT_SECRET="use-a-long-random-secret-at-least-32-characters"
```

## Run

This project uses Maven and should be run with `JDK 21` because Lombok in this project does not compile correctly on `JDK 24`.

```powershell
cd backend
mvn spring-boot:run
```

If Maven is not installed on your machine yet, install it first or generate a wrapper.

You can also use the included helper script:

```powershell
backend\start-backend.cmd
```

## Seeded Login Accounts

These are inserted automatically on first run and login now uses email:

- `admin@shiftsync.local` / `admin123`
- `manager@ngabopharmacy.rw` / `manager123`
- `employee@ngabopharmacy.rw` / `employee123`

## Useful Endpoints

Public:
- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`

Authenticated (send `Authorization: Bearer <token>`):
- `POST /api/auth/change-password`
- `GET /api/auth/validate`
- `GET /api/employee/**`
- `POST /api/chat/message`

Manager or Admin:
- `GET /api/manager/workspace/{userId}`
- `GET /api/dashboard/overview/{managerId}`
- `GET /api/scheduling/shifts`
- `POST /api/scheduling/manager/**`

Admin only:
- `GET /api/admin/**`
- `POST /api/auth/register`

Swagger UI:
- `GET /swagger-ui.html`

## Security

- Passwords are hashed with BCrypt.
- Login returns a signed JWT. The frontend stores it and sends it on every API call.
- Admin routes require `ROLE_ADMIN`.
- Manager routes require `ROLE_MANAGER` or `ROLE_ADMIN`.
- Employee routes require any authenticated active account.
- Deactivated users cannot sign in and existing tokens are rejected on the next request.
