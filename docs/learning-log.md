# Backend Project – Learning Log

This document tracks what I learned, why decisions were made, issues faced, and how they were resolved.
It is meant for **internal review and interview preparation**, not for public readers.

---

## Day 1 — Backend Foundation Setup

### Goal
- Set up a runnable Express server with MongoDB connection.

### Learned
- Basic Node.js + Express project structure.
- Why environment variables (`.env`) are used for configuration.
- Difference between MongoDB server and MongoDB Compass.

### Issues Faced
- PowerShell execution policy blocked `npm`.
- MongoDB CLI not available in PATH.

### Fix
- Updated execution policy for the current user.
- Verified MongoDB using Compass instead of CLI.

### Notes
- Environment issues are common; fixing them early avoids confusion later.

---

## Day 2 — User Model (Schema)

### Goal
- Define the structure of a User in the backend.

### Learned
- What Mongoose is and why it adds structure on top of MongoDB.
- Difference between schema, model, and collection.
- `unique: true` creates a database-level constraint, not just validation.

### Notes
- MongoDB creates collections only after the first write operation.

---

## Day 3 — Saving Data with Mongoose

### Goal
- Save user data to MongoDB without using an API.

### Learned
- How `new Model()` and `model.save()` work.
- Async nature of database operations.
- MongoDB automatically creates database and collection on first insert.

### Notes
- Writing to DB without HTTP helps isolate persistence logic.

---

## Day 4 — First API (POST /users)

### Goal
- Create a real HTTP API to save users.

### Learned
- Clear separation between Node.js logic and Express (HTTP layer).
- Role of routes vs controllers.
- Full request → controller → database flow.

### Major Issue Faced
- MongoDB not connecting even though server was running.

### Root Cause
- Used `await connectDB` instead of `await connectDB()`  
  (function reference vs function invocation).

### Fix
- Corrected async function call.
- Ensured DB connection before starting the server.

### Interview Note
- Express server can run without DB; DB failures must be handled explicitly.

---

## Day 5 — Validation & Duplicate Handling

### Goal
- Make the API defensive and production-aware.

### Learned
- Manual input validation and returning `400 Bad Request`.
- Handling MongoDB duplicate key error (`E11000`).
- Mapping DB conflicts to proper HTTP response (`409 Conflict`).

### Notes
- Known client errors should not return `500`.
- Using `return res...` is necessary to prevent sending multiple responses.

---

## Day 6 — Service Layer Introduction

### Goal
- Separate business logic from HTTP logic.

### Learned
- What a service layer is and why it exists.
- Controllers should only handle request/response.
- Services should be framework-agnostic.

### Changes Made
- Moved user creation logic from controller to service.
- Controller now delegates work to service.

### Notes
- This structure improves testability and scalability.
- Behavior remained unchanged after refactor (important check).

---

## Day 7 — Centralized Error Handling (Middleware)

### Goal
- Centralize error handling using Express error middleware.
- Reduce duplication and prepare controllers to stay thin.

### Learned
- Express identifies error middleware by the `(err, req, res, next)` signature.
- Error middleware must be registered **after routes**.
- System-level errors (DB errors) should be handled centrally.

### Changes Made
- Added global error-handling middleware.
- Wired error middleware after routes in `server.js`.

### Notes
- Controller still contains duplicate error handling temporarily.
- This is a transitional phase to avoid breaking behavior.
- Next step will be to remove controller-level system error handling and delegate fully to middleware.

---

## Day 8 — Error Propagation with `next(err)`

### Goal
- Complete migration to centralized error handling.
- Remove system-level error handling from controllers.

### Learned
- `next(err)` forwards errors to Express error-handling middleware.
- Controllers must explicitly declare `next` to use it.
- Express differentiates normal middleware vs error middleware by function signature.

### Changes Made
- Updated controller to use `next(err)` for unexpected/system errors.
- Centralized duplicate and server error responses in error middleware.

### Issue Faced
- Encountered `next is not defined` error.

### Root Cause
- Controller function did not declare `next` as a parameter.

### Fix
- Updated controller signature to `(req, res, next)`.

### Notes
- Controllers now handle only validation and success responses.
- Error middleware owns all system-level error responses.

---

## Day 9 — Validation Middleware

### Goal
- Move request validation out of controllers.
- Keep controllers focused on flow and business logic.

### Learned
- Validation fits naturally as middleware in Express.
- Middleware can block invalid requests before reaching controllers.
- Clean middleware ordering makes request flow predictable.

### Changes Made
- Created validation middleware for user creation.
- Removed validation logic from controller.
- Wired validation middleware into user routes.

### Notes
- Controllers now assume validated input.
- Validation is reusable and centralized.
- This structure scales better as APIs grow.

---

## Day 10 — Request Normalization & Async Validation

### Goal
- Normalize incoming request data.
- Catch duplicate emails early using async validation middleware.

### Learned
- Validation middleware can be synchronous or asynchronous.
- Normalization (trim, lowercase) should happen before business logic.
- Async validation can query the database before controller/service execution.

### Changes Made
- Added normalization for name and email in validation middleware.
- Added async check to detect existing email before saving user.

### Notes
- Middleware validation is the first line of defense.
- Database unique constraint remains the final authority to handle race conditions.
- Controllers and services remained unchanged.

---

## Day 11 — Password Hashing (Auth Foundation)

### Goal
- Store user passwords securely using hashing.
- Prepare the system for authentication without implementing login yet.

### Learned
- Passwords must never be stored in plain text.
- Hashing is one-way and different from encryption.
- `bcrypt` is industry standard for password hashing.
- Hashing belongs in the service layer as business logic.

### Changes Made
- Added password field to User schema.
- Installed bcrypt for hashing.
- Hashed password before saving user to database.
- Updated validation middleware to require password.
- Updated controller to pass password to service.

### Notes
- Stored password is a hash, not the original value.
- Salt rounds (10) balance security and performance.
- Login and password comparison will be added later using `bcrypt.compare()`.

---

## Day 12 — User Login (Authentication Phase 1)

### Goal
- Implement basic user login using email and password.
- Verify credentials securely without tokens.

### Learned
- Login logic belongs in the service layer.
- Password verification must use bcrypt.compare.
- Controllers should only coordinate request and response.
- Centralized error middleware must respect custom status codes.
- DB constraints remain the final safeguard against race conditions.

### Changes Made
- Added login service to verify user credentials.
- Added login controller to handle HTTP flow.
- Added login validation middleware.
- Wired login route under /users/login.
- Fixed error middleware to handle custom status codes correctly.

### Notes
- JWT and session handling are intentionally deferred.
- Model-level normalization will be handled in a later refactor.

---

## Day 13 — Model-Level Normalization & Data Safety

### Goal
- Guarantee consistent data storage regardless of request source.
- Prevent duplicate users caused by spacing or case differences.

### Learned
- Middleware normalization improves API experience.
- Model-level normalization guarantees database consistency.
- Defense-in-depth avoids bugs caused by missed validation.
- DB unique constraints remain the final enforcement layer.

### Changes Made
- Added trim and lowercase normalization to User model fields.
- Verified duplicate emails are blocked regardless of spacing or case.

### Notes
- Existing records are not auto-migrated.
- Middleware normalization is intentionally retained.

---

## Day 14 — JWT Authentication (Token Issuance)

### Goal
- Issue a JWT on successful user login.
- Establish the foundation for stateless authentication.

### Learned
- JWT is a signed token used to prove authentication after login.
- Passwords are used only during login; JWT is used afterward.
- Token generation belongs in the controller, not the service.
- JWT payload should be minimal and never contain sensitive data.
- Token expiry is critical for security.

### Changes Made
- Installed jsonwebtoken library.
- Generated JWT on successful login.
- Configured JWT secret and expiry using environment variables.
- Returned token to client on login success.

### Notes
- Token verification and route protection are handled in the next phase.
- Refresh tokens and cookies are intentionally deferred.

---

## Day 14 — JWT Authentication (Token Issuance)

### Goal
- Issue a JWT on successful user login.
- Establish the foundation for stateless authentication.

### Learned
- JWT is a signed token used to prove authentication after login.
- Passwords are used only during login; JWT is used afterward.
- Token generation belongs in the controller, not the service.
- JWT payload should be minimal and never contain sensitive data.
- Token expiry is critical for security.

### Changes Made
- Installed jsonwebtoken library.
- Generated JWT on successful login.
- Configured JWT secret and expiry using environment variables.
- Returned token to client on login success.

### Notes
- Token verification and route protection are handled in the next phase.
- Refresh tokens and cookies are intentionally deferred.

---

## Day 15 — JWT Verification & Protected Routes

### Goal
- Verify JWT sent by client.
- Protect routes from unauthenticated access.

### Learned
- Auth middleware acts as a gatekeeper before routes.
- JWT verification checks signature and expiry.
- Identity should be attached to req for downstream use.
- Middleware is the correct place for cross-cutting concerns like auth.

### Changes Made
- Added JWT authentication middleware.
- Verified tokens using jsonwebtoken.
- Protected a sample route (/users/me).
- Confirmed access control works with valid/invalid tokens.

### Notes
- DB lookup and authorization are intentionally deferred.

---

## Day 16 — Auth Context & Authorization Preparation

### Goal
- Convert authenticated identity into a real user context.
- Prepare the system for authorization logic.

### Learned
- Authentication answers “who you are”.
- Authorization answers “what you are allowed to do”.
- JWT alone is not enough; DB is the source of truth.
- Auth middleware should attach full user context to req.

### Changes Made
- Updated auth middleware to load user from database.
- Ensured deleted users cannot access protected routes.
- Removed password field from attached user context.

### Notes
- Role-based access control will be added later.

---

## Day 17 — Role-Based Authorization (RBAC)

### Goal
- Introduce roles and restrict access based on permissions.

### Learned
- Authorization is different from authentication.
- RBAC enforces what actions a user is allowed to perform.
- Auth context must be attached to req, not res.
- Middleware factories enable flexible role checks.

### Changes Made
- Added role field to User model with safe defaults.
- Implemented authorizeRoles middleware.
- Protected an admin-only route.
- Verified access control for user vs admin roles.

### Notes
- Role assignment flow is manual for now.
- Fine-grained permissions will be added later.

---

## Day 18 — Resource Ownership & Permission Checks

### Goal
- Enforce data-level authorization based on resource ownership.

### Learned
- Ownership authorization is different from RBAC.
- `req.user` must always represent the authenticated actor.
- Authorization does not imply data retrieval.
- Admins may access any resource, but target data must be fetched explicitly.

### Changes Made
- Added reusable ownership authorization middleware.
- Protected user routes using ownership checks.
- Verified behavior for user vs admin access.

### Notes
- Profile data fetching for admins is deferred to the next day.

---

## Day 19 — Profile Fetching & Actor vs Subject Separation

### Goal
- Return correct user profile data while preserving authorization logic.

### Learned
- `req.user` must always represent the authenticated actor.
- Target resources (subjects) must be fetched explicitly.
- Authorization and data retrieval are separate responsibilities.
- Admin access does not mean returning admin data.

### Changes Made
- Updated profile route to fetch target user by ID.
- Ensured password field is excluded from responses.
- Verified correct behavior for user and admin access.

### Notes
- Actor vs subject separation prevents serious security bugs.

---

## Day 20 — Update Profile with Ownership & Validation

### Goal
- Allow safe profile updates while enforcing ownership and authorization.

### Learned
- Validation should restrict allowed update fields.
- Never trust req.body directly — whitelist in controller.
- Use defense-in-depth: validation + controller + schema.
- PUT updates are simpler and safer early on than PATCH.

### Changes Made
- Added update validation middleware.
- Implemented PUT profile update route.
- Blocked sensitive field updates (role, password).
- Verified user vs admin update behavior.

### Notes
- Password update and email verification are deferred.

---

## Day 21 — Secure Password Change Flow

### Goal
- Allow authenticated users to change their own password securely.

### Learned
- Password change is a high-risk operation and must be tightly controlled.
- Authorization allows who may attempt an action; business logic determines whether it can succeed.
- Admins are not explicitly blocked from password change routes, but cannot complete them without knowing the current password.
- Sensitive actions should rely on proof (old password), not only roles.

### Changes Made
- Added password change validation middleware.
- Implemented secure password change route using bcrypt.
- Enforced ownership checks for password updates.
- Required old password verification before updating.

### Notes
- Admin password reset should be a separate, explicit flow.
- Forgot-password and token invalidation are deferred.

---

## Day 22 — Logout & JWT Reality

### Goal
- Implement logout behavior correctly in a JWT-based authentication system.
- Understand what logout actually means when using stateless tokens.

### Learned
- JWTs are stateless and cannot be invalidated server-side without extra infrastructure.
- “Logout” in JWT systems usually means deleting the token on the client.
- Server-side logout endpoints should be honest and not pretend to revoke tokens.
- Token blacklisting or refresh-token strategies are required for true revocation.
- Not all logic needs a service layer; architecture should emerge from complexity.

### Changes Made
- Added authenticated logout endpoint.
- Ensured logout behavior instructs client to delete token.
- Preserved clean separation between auth, authorization, and request handling.

### Notes
- Token blacklisting and refresh-token flows are deferred.
- No refactoring was done to avoid premature abstraction.

---
