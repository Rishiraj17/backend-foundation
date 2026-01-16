const express = require("express");
const { createUser, loginUser } = require("../controllers/user.controller");
const { validateCreateUser, validateLoginUser } = require("../middleware/user.validation");
const router=express.Router();
const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/authorize.middleware");
const authorizeOwnership = require("../middleware/ownership.middleware");
const User = require("../models/user.model");

router.post("/", validateCreateUser, createUser);
router.post("/login",validateLoginUser,loginUser);

router.get("/me",authenticate,(req,res)=>{
    res.status(200).json({
        message:"Access granted",
        user:req.user
    });
});

router.get(
    "/admin-test",
    authenticate,
    authorizeRoles("admin"),
    (req, res) => {
        res.status(200).json({
            message:"Admin access granted",
            user: req.user
        });
    }
);

router.get(
    "/:userId",
    authenticate,
    authorizeOwnership("userId"),
    async (req, res, next) => {
        try{
            const targetUser = await( User.findById(req.params.userId).select("-password"));

            if(!targetUser){
                return res.status(404).json({
                    message:"User not found"
                });
            }

            res.status(200).json({
                message:"User profile access granted",
                user:targetUser
            });
        } catch(error){
            next(error);
        }
    }
);

module.exports = router;