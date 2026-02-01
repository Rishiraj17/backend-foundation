const express = require("express");
const router = express.Router();

const { authLimiter } = require("../middleware/rateLimit.middleware");
const { validateLoginUser} = require("../middleware/user.validation");
const { loginUser, refreshAccessToken, logout } = require("../controllers/auth.controller");
const authenticate = require("../middleware/auth.middleware");

/**
 * Auth Router
 * --------------
 * Handles authentication and session lifecycle.
 * Responsible for login, token refresh, and logout.
 * Does not handle user profile or admin logic.
 */

//=================================================================================================
//AUTHENTICATION

// Login and issue access + refresh tokens
router.post("/login", authLimiter, validateLoginUser, loginUser);

// Refresh access token using refresh token  
router.post("/refresh", refreshAccessToken);

// Logout and revoke current session
router.post("/logout",authenticate , logout);

module.exports = router;