## Phase 2 – Day 1: Login Failure Tracking

### What we built
- Added security-related state to the user model:
  - `failedLoginAttempts`
  - `lastFailedLoginAt`
  - `lockUntil`
  - `accountStatus`
- Implemented login pre-checks to block:
  - suspended accounts
  - temporarily locked accounts
- Added failure tracking for incorrect password attempts.
- Enforced automatic temporary account lock after repeated failures.
- Implemented state reset on successful login.
- Added audit logs for:
  - failed login attempts
  - account lock events
  - login recovery after failures

---

### Why this was needed
- Password-based authentication alone is vulnerable to brute-force attacks.
- Rate limiting is not sufficient once credentials are known.
- The system needed server-side state to reason about repeated failures over time.
- This feature introduces the first layer of **account trust enforcement**.

---

### How it works (high level)
- On every login attempt:
  - Account status and lock state are checked **before** password comparison.
- On failed password:
  - Failure count is incremented.
  - Timestamp of failure is stored.
  - After a threshold (5 attempts), the account is temporarily locked for 15 minutes.
- On successful login:
  - Any previous failure-related state is cleared.
  - Temporary locks are removed.
  - Recovery is recorded via audit logs.

---

### Important design decisions
- Temporary locks are enforced using `lockUntil` (time-based).
- Long-term restrictions are modeled separately via `accountStatus`.
- Password comparison is skipped entirely for locked or inactive accounts.
- All persistence operations are explicitly awaited to ensure correctness.
- Security state transitions are auditable.

---

### Issues encountered
- Incorrect time arithmetic when calculating lock duration.
- Missing `await` on persistence could lead to inconsistent state.
- Password comparison was initially happening before lock checks.

---

### How they were fixed
- Lock duration is now calculated using epoch-based time math.
- All state mutations are awaited before errors are thrown.
- Pre-checks were moved ahead of password comparison to enforce locks correctly.

---

### Outcome
- Brute-force protection is now enforced at the account level.
- Authentication behavior is predictable and explainable.
- This establishes the first concrete “trust” feature beyond basic authentication.

---
