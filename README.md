# NexusHR

A full-stack Human Resource Management System (HRMS) covering the employee lifecycle —
people records, attendance, leave, payroll, performance, and workforce analytics — behind
role-based access control with JWT authentication.

## Stack

**Backend**
- Java 21, Spring Boot 3.3.5
- Spring Security with JWT access + refresh tokens (jjwt 0.11.5)
- Spring Data JPA / Hibernate
- Spring Mail (Brevo SMTP) for account emails
- H2 for local development, PostgreSQL for deployment
- Lombok

**Frontend**
- React 19 + TypeScript, built with Vite
- Tailwind CSS 4 with shadcn/ui and Radix primitives
- TanStack Query for server state, Axios for transport
- Recharts for analytics visualisations
- React Router 7

## Features

**People management**
- Employee records, departments, and designations
- User accounts with role and permission assignment

**Time and attendance**
- Attendance tracking
- Leave requests and approval workflow

**Payroll**
- Payroll records tied to employee data

**Performance**
- Appraisals, goals, KPIs, and feedback

**Analytics**
- Dashboard summary metrics
- Attrition analysis, skill-gap tracking, and workforce insights
- Report generation

**Platform**
- Signup, login, and token refresh with rotating refresh tokens
- Email verification and password reset via time-limited tokens
- Account lockout after repeated failed logins
- In-app notifications with per-user preferences
- Configurable company settings

## Authentication

Access tokens are short-lived (15 minutes by default) and paired with longer-lived refresh
tokens (7 days), which are persisted so they can be revoked on logout.

Public endpoints (`SecurityConfig`):

```
POST /api/auth/signup              POST /api/auth/forgot-password
POST /api/auth/login               POST /api/auth/reset-password
POST /api/auth/refresh             POST /api/auth/verify-email
POST /api/auth/logout              POST /api/auth/resend-verification
```

`GET /api/auth/me` returns the authenticated user. Everything under `/api/users/**`
requires the `ADMIN` role; all other endpoints require authentication.

Roles are database rows rather than a fixed enum — a `Role` owns a set of `Permission`
records — so roles and their permissions can be managed at runtime through
`/api/roles` and `/api/permissions`.

## Running locally

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Runs on `http://localhost:8080`. No setup is required: the default profile uses an
**in-memory H2 database**, so the schema is rebuilt from the JPA entities on every start
and **all data is lost when the app stops**. The H2 console is at
`http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:mem:nexushr_db`, user `sa`, no
password).

There is no seeded admin account. Create the first user through `POST /api/auth/signup`,
then grant it the `ADMIN` role directly in the database — admin-only endpoints are
unreachable until a user holds that role.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and talks to `http://localhost:8080/api` by default.
Point it elsewhere with `VITE_API_BASE_URL`.

## Configuration

### Profiles

| Profile | Database | Use |
| --- | --- | --- |
| default | H2 in-memory | Local development. Zero configuration. |
| `postgres` | Local PostgreSQL | Development against a persistent database. |
| `prod` | PostgreSQL via env vars | Deployment. Requires `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`. |

Activate one with `SPRING_PROFILES_ACTIVE=prod`.

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `DB_URL` | — | JDBC URL (`prod` profile). |
| `DB_USERNAME` / `DB_PASSWORD` | — | Database credentials (`prod` profile). |
| `PORT` | `8080` | HTTP port. |
| `JWT_SECRET` | dev fallback | **Set this in any deployment.** Long random string. |
| `JWT_ACCESS_TOKEN_EXPIRATION_MS` | `900000` | Access token lifetime (15 min). |
| `JWT_REFRESH_TOKEN_EXPIRATION_MS` | `604800000` | Refresh token lifetime (7 days). |
| `AUTH_MAX_FAILED_ATTEMPTS` | `5` | Failed logins before lockout. |
| `AUTH_LOCKOUT_DURATION_MINUTES` | `15` | Lockout duration. |
| `EMAIL_VERIFICATION_TOKEN_HOURS` | `24` | Verification token validity. |
| `PASSWORD_RESET_TOKEN_HOURS` | `2` | Reset token validity. |
| `FRONTEND_BASE_URL` | `http://localhost:5173` | Base for links in emails. |
| `CORS_ALLOWED_ORIGINS` | localhost dev origins | Comma-separated allowed origins. |
| `APP_MAIL_ENABLED` | `false` | Enables outbound email. |
| `MAIL_HOST` / `MAIL_PORT` | Brevo relay, `587` | SMTP server. |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | empty | SMTP credentials. |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Frontend → backend base URL. |

Local overrides can go in a `.env` file at the repo root or in `backend/`; both are
imported automatically and are gitignored.

With `APP_MAIL_ENABLED=false`, email verification and password reset generate tokens but
send nothing — fine for local work, but both flows need real SMTP credentials to be
usable by end users.

## Project structure

```
backend/     Spring Boot API
  config/        security, password encoding
  controller/    REST endpoints (23 controllers)
  dto/           request/response payloads
  entity/        JPA entities (23 entities)
  repository/    Spring Data repositories
  service/       business logic
  security/      JWT filter and token handling
frontend/    React + TypeScript client
  Pages/         route-level screens
  components/    UI and layout components
  services/      Axios API client with token refresh
  context/       auth context
```

## Deployment

The `prod` profile reads its datasource and secrets entirely from environment variables
and binds to `$PORT`, so it runs on any container host. `ddl-auto=update` builds the
schema on first boot, so a new empty PostgreSQL database needs no migration step.

Set at minimum: `SPRING_PROFILES_ACTIVE=prod`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`,
`JWT_SECRET`, and `CORS_ALLOWED_ORIGINS` pointing at the deployed frontend origin.
