const express = require("express");
const { createUser } = require("../controllers/user.controller");
const { validateCreateUser } = require("../middleware/user.validation");
const router=express.Router();

router.post("/", validateCreateUser, createUser);

module.exports = router;