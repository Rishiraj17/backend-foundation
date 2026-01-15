const express = require("express");
const { createUser, loginUser } = require("../controllers/user.controller");
const { validateCreateUser, validateLoginUser } = require("../middleware/user.validation");
const router=express.Router();

router.post("/", validateCreateUser, createUser);
router.post("/login",validateLoginUser,loginUser);

module.exports = router;