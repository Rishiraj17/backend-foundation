const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/authorize.middleware");
const { getAllUsers } = require("../controllers/admin.controller");
const { validateUpdateUser } = require("../middleware/user.validation");

const User = require("../models/user.model");

/**
 * Admin Router
 * ----------------
 * Handles admin-only system and user management actions.
 * All routes require authenticated user with admin role.
 * No self-user or authentication lifecycle logic exists here.
 */

// ==========================================================================================
// USER MANAGEMENT (ADMIN)

// Get Pagination & filtered list of users
router.get(
    "/users",
    authenticate,
    authorizeRoles("admin"),
    getAllUsers
);

// Get any user's profile
router.get(
    "/users/:userId",
    authenticate,
    authorizeRoles("admin"),
    async ( req,res,next )=>{
        try{
            const user = await User.findById(req.params.userId).select("-password");

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
)

// Update any user's profile
router.patch(
    "/users/:userId",
    authenticate,
    authorizeRoles("admin"),
    validateUpdateUser,
    async (req, res, next)=>{
        try{
            const updates = {};
            if(req.body.name) updates.name = req.body.name;
            if(req.body.email) updates.email = req.body.email;

            const updatedUser = await User.findByIdAndUpdate(
                req.params.userId,
                updates,
                {
                    new: true,               //return updated doc
                    runValidators: true,     //enforce schema rules
                }
            ).select("-password");

            if(!updatedUser){
                return res.status(404).json({
                    message: "User not found"
                });
            }

            res.status(200).json({
                message: "Profile update successfully",
                user: updatedUser
            });
        } catch(error){
            next(error);
        }
    }
);


module.exports = router;