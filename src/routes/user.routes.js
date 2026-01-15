const express = require("express");
const { createUser, loginUser } = require("../controllers/user.controller");
const { validateCreateUser, validateLoginUser } = require("../middleware/user.validation");
const router=express.Router();
const authenticate = require("../middleware/auth.middleware");

router.post("/", validateCreateUser, createUser);
router.post("/login",validateLoginUser,loginUser);

router.get("/me",authenticate,(req,res)=>{
    res.status(200).json({
        message:"Access granted",
        user:req.user
    });
});

module.exports = router;