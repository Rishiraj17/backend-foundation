const express = require("express");
const { createUser, loginUser } = require("../controllers/user.controller");
const { validateCreateUser, validateLoginUser, validateUpdateUser, validateChangePassword } = require("../middleware/user.validation");
const router=express.Router();
const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/authorize.middleware");
const authorizeOwnership = require("../middleware/ownership.middleware");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");

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

router.put(
    "/:userId",
    authenticate,
    authorizeOwnership("userId"),
    validateUpdateUser,
    async (req, res, next)=>{
        try{
            const updates = {};
            if(req.body.name) updates.name = req.body.name;
            if(req.body.email) updates.email = req.body.email;

            const updateUser = await User.findByIdAndUpdate(
                req.params.userId,
                updates,
                {
                    new: true,               //return updated doc
                    runValidators: true,     //enforce schema rules
                }
            ).select("-password");

            if(!updateUser){
                return res.status(404).json({
                    message: "User not found"
                });
            }

            res.status(200).json({
                message: "Profile update successfully",
                user: updateUser
            });
        } catch(error){
            next(error);
        }
    }
);

router.put(
    "/:userId/change-password",
    authenticate,
    authorizeOwnership("userId"),
    validateChangePassword,
    async (req, res, next) =>{
        try{
            const { oldPassword, newPassword } = req.body;

            //fetch target user (subject)
            const user = await User.findById(req.params.userId);

            if(!user){
                return res.status(404).json({
                    message:"User not found"
                });
            }

            //verify old password
            const isMatch = await bcrypt.compare(oldPassword,user.password);

            if(!isMatch){
                return res.status(401).json({
                    message:"Old password is incorrect"
                });
            }

            //hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            user.password = hashedPassword;
            await user.save();

            return res.status(200).json({
                message:"Password changed successfully"
            });
        }catch (error){
            next(error);
        }
    }
);


module.exports = router;