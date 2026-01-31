const express = require("express");
const router = express.Router();

const { loginUser, refreshAccessToken } = require("../controllers/auth.controller");

//login
router.post("/login",loginUser);

//refresh access Token 
router.post("/refresh", refreshAccessToken);

module.exports = router;