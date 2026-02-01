# Backend Architecture Overview - Foundational Phase

## System Purpose
This backend serves as a production-oriented foundation for building secure, scalable applications.
It is designed to demonstrate real-world backend practices including authentication, authorization,
session management, and role-based access control.

The project intentionally avoids tutorial-style CRUD and instead focuses on:
- clear responsibility boundaries
- secure authentication flows
- maintainable architecture
- interview-ready design decisions

---

## High-Level Architecture

The backend follows a layered architecture:

Client  
→ Routes  
→ Middleware  
→ Controllers  
→ Services  
→ Models (Database)  
→ Response

Each layer has a single, well-defined responsibility.

---

## Core Architectural Principles

- **Separation of concerns**  
  Authentication, user actions, and admin actions are handled in separate routers.

- **Explicit access control**  
  User identity is derived from access tokens, never from request parameters.
  Admin privileges are enforced explicitly at the route level.

- **Session-based security**  
  Refresh tokens are stored server-side and treated as sessions.
  Logout and password change revoke sessions to prevent token reuse.

- **Foundation-first approach**  
  This project represents a stable backend baseline from which future features will evolve.

---

## Router-Level Architecture

The backend is organized around three primary routers.
Each router has a single, clearly defined responsibility and strict boundaries.

This separation ensures:
- simpler authorization logic
- clearer request flows
- easier future extension
- strong interview explanations

---

### Auth.router

**Purpose**  
Handles authentication and session lifecycle management.

This router is responsible for:
- verifying user credentials
- issuing access and refresh tokens
- refreshing expired access tokens
- revoking sessions on logout

**Access Scope**
- Public access: login, refresh
- Authenticated access: logout

**Endpoints**
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

**What it does NOT handle**
- User profile data
- Password updates
- Admin or cross-user actions

Auth.router is intentionally isolated so that authentication logic does not leak into user or admin workflows.

---

### User.router

**Purpose**  
Handles actions performed by an authenticated user on **their own account**.

User identity is always derived from the access token (`req.user`).
No user identifiers are accepted via route parameters.

**Access Scope**
- Authenticated users only

**Endpoints**
- `POST /users`  
  Create a new user account (registration)

- `GET /users/me`  
  Fetch authenticated user’s profile

- `PATCH /users/me`  
  Update authenticated user’s profile

- `PATCH /users/change-password`  
  Change password and revoke all active sessions

**What it does NOT handle**
- Authentication lifecycle (login / logout / refresh)
- Admin-only or cross-user operations
- Any route accepting `:userId`

This design ensures self-user actions remain secure and unambiguous.

---

### Admin.router

**Purpose**  
Handles admin-only system and cross-user management actions.

All routes require:
- authenticated user
- admin role authorization

**Access Scope**
- Admin users only

**Endpoints**
- `GET /admin/users`  
  Fetch paginated and filtered list of users

- `GET /admin/users/:userId`  
  Fetch any user’s profile

- `PATCH /admin/users/:userId`  
  Update any user’s profile

**What it does NOT handle**
- Authentication lifecycle
- Self-user profile logic
- Password changes for users

Admin.router makes cross-user access explicit and prevents privilege confusion.

---

## Router Responsibility Summary

| Router       | Responsibility                               |
|--------------|----------------------------------------------|
| Auth.router  | Authentication & session lifecycle           |
| User.router  | Self-user actions (no identifiers)           |
| Admin.router | Admin-only, cross-user system operations     |

---

## Request Flow Analysis

This section explains how requests are processed end-to-end in the backend.
All major flows follow the same high-level pipeline, with variations depending on access type.

---

## Common Request Pipeline

Every request follows this sequence:

Client  
→ Router  
→ Middleware  
→ Controller  
→ Service (if applicable)  
→ Database (Models)  
→ Response Utility / Error Handler  
→ Client

Each layer has a strict responsibility and does not leak concerns into other layers.

---

## Authentication Flow (Login)

### Flow: `POST /auth/login`

1. **Router**
   - Incoming request is routed to `Auth.router`.

2. **Rate Limiting Middleware**
   - Prevents brute-force login attempts.

3. **Validation Middleware**
   - Validates email and password format.
   - Normalizes email (lowercase, trimmed).

4. **Controller (`loginUser`)**
   - Delegates credential verification to service.
   - Generates:
     - short-lived access token
     - long-lived refresh token
   - Stores hashed refresh token in database as a session.
   - Enforces session limits by revoking oldest sessions if needed.
   - Emits audit log.

5. **Response**
   - Access token + refresh token returned to client.

---

## Access Token Refresh Flow

### Flow: `POST /auth/refresh`

1. **Router**
   - Request enters `Auth.router`.

2. **Controller (`refreshAccessToken`)**
   - Validates refresh token.
   - Hashes token and looks up active session in database.
   - Verifies token is not expired or revoked.
   - Issues new access token.

3. **Response**
   - New access token returned.
   - Refresh token remains unchanged.

This keeps access tokens stateless while refresh tokens remain server-controlled.

---

## Logout Flow

### Flow: `POST /auth/logout`

1. **Router**
   - Request enters `Auth.router`.

2. **Authentication Middleware**
   - Validates access token.
   - Attaches authenticated user context to `req.user`.

3. **Controller (`logout`)**
   - Hashes refresh token provided by client.
   - Marks matching session as revoked in database.
   - Emits audit log.

4. **Response**
   - Logout success message returned.

Logout invalidates the session server-side, not just on the client.

---

## Authenticated User Flow (Self Actions)

### Example: `GET /users/me`

1. **Router**
   - Request enters `User.router`.

2. **Authentication Middleware**
   - Verifies access token.
   - Attaches user identity to `req.user`.

3. **Controller**
   - Uses `req.user` as the single source of truth.
   - Fetches user data from database.
   - Excludes sensitive fields.

4. **Response**
   - User profile returned.

No route parameters are used for self-user access.

---

## Password Change Flow (Critical Security Flow)

### Flow: `PATCH /users/change-password`

1. **Router**
   - Request enters `User.router`.

2. **Authentication Middleware**
   - Ensures request is authenticated.

3. **Controller (`changePassword`)**
   - Verifies old password.
   - Hashes and updates new password.
   - Revokes **all active refresh-token sessions** for the user.
   - Emits audit log.

4. **Response**
   - Password change confirmation returned.

This ensures compromised sessions are invalidated immediately.

---

## Admin Flow (Cross-User Access)

### Example: `GET /admin/users/:userId`

1. **Router**
   - Request enters `Admin.router`.

2. **Authentication Middleware**
   - Verifies access token.

3. **Authorization Middleware**
   - Ensures user has admin role.

4. **Controller**
   - Fetches requested user data by ID.
   - No ownership checks needed due to explicit admin scope.

5. **Response**
   - Requested user data returned.

Admin routes explicitly operate on other users.

---

## Error Handling Flow

1. Any layer may throw an error.
2. Errors propagate to centralized error middleware.
3. Error response is normalized.
4. Stack trace is conditionally exposed in development mode only.

This ensures consistent and predictable error responses.

---

## Key Design Takeaways

- User identity always comes from access tokens, never from route parameters.
- Refresh tokens are treated as server-side sessions.
- Session revocation is enforced on logout and password change.
- Admin access is explicit and isolated.
- Controllers coordinate logic; services handle business rules; models handle persistence.

---

## Architecture Guarantees (Foundation Stage)

This section documents the architectural guarantees provided by the backend
at the foundation stage. These guarantees describe what the system enforces
today and what other parts of the application can safely rely on.

---

## Identity & Access Guarantees

- Authenticated user identity is always derived from the access token.
- User routes never rely on request parameters to identify the current user.
- Admin access is enforced explicitly at the route level.
- Cross-user operations are isolated under admin routes.

As a result, privilege boundaries are clear and predictable.

---

## Authentication & Session Guarantees

- Access tokens are short-lived and stateless.
- Refresh tokens are stored server-side and treated as sessions.
- Each refresh token represents a single active session.
- Sessions can be revoked individually or in bulk.

The backend does not rely on client-side token deletion for security.

---

## Session Invalidation Guarantees

Active sessions are revoked when:
- a user logs out
- a user changes their password
- session limits are exceeded

This ensures that sensitive actions immediately invalidate existing access paths.

---

## Error Handling Guarantees

- All errors propagate to a centralized error handler.
- Error responses follow a consistent structure.
- Internal stack traces are only exposed in development environments.

This ensures predictable error behavior across all routes.

---

## Stability of the Foundation

At this stage:
- routing boundaries are stable
- authentication flows are complete
- session management is enforced
- admin and user responsibilities are clearly separated

This document reflects the current, stable state of the backend.

---