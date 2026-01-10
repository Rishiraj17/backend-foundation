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