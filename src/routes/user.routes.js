const express = require("express");
const router=express.Router();

const { createUser, changePassword } = require("../controllers/user.controller");
const { validateCreateUser,  validateUpdateUser } = require("../middleware/user.validation");
const authenticate = require("../middleware/auth.middleware");

const User = require("../models/user.model");
/**
 * User Router
 * ----------------
 * Handles self-user actions only.
 * All routes assume an authenticated user context.
 * No admin or authentication lifecycle logic exists here.
 */

//===============================================================================================
//USER REGISTRATION

// Create a new user account
router.post("/", validateCreateUser, createUser);

//=================================================================================
//USER PROFILE

// Get authenticated user's profile 
router.get(
    "/me",
    authenticate,
    async (req, res, next) => {
        try{
            const user = await( User.findById(req.user._id).select("-password"));

            if(!user){
                return res.status(404).json({
                    message:"User not found"
                });
            }

            res.status(200).json({
                message:"User profile fetched",
                user
            });
        } catch(error){
            next(error);
        }
    }
);

// Update authenticated user profile (self)
router.patch(
    "/me",
    authenticate,
    validateUpdateUser,
    async (req,res,next)=>{
        try{
            const updates = {};
            if(req.body.name) updates.name = req.body.name;
            if(req.body.email) updates.email = req.body.email;

            const updatedUser = await User.findByIdAndUpdate(
                req.user._id,
                updates,
                {
                    new:true,
                    runValidators: true,
                }
            ).select("-password");

            if(!updatedUser){
                return res.status(404).json({
                    message:"User not found"
                });
            }

            res.status(200).json({
                message:"User profile updated successfully",
                user: updatedUser
            });
        }catch(error){
            next(error);
        }
    }
)

//=============================================================================================
// ACCOUNT SECURITY ROUTES

// Change password and revoke all active sessions
router.patch("/change-password",
    authenticate,
    changePassword
)

module.exports = router;