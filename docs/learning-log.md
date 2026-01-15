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

