const express = require("express");
const router = express.Router();

const { loginUser, refreshAccessToken, logout } = require("../controllers/auth.controller");

//login
router.post("/login",loginUser);

//refresh access Token 
router.post("/refresh", refreshAccessToken);

//logout
router.post("/logout",logout);

module.exports = router;