const express = require("express");
const { loginUser } = require("../controllers/auth.controller");
const { createUser, changePassword } = require("../controllers/user.controller");
const { validateCreateUser, validateLoginUser, validateUpdateUser, validateChangePassword } = require("../middleware/user.validation");
const router=express.Router();
const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/authorize.middleware");
const authorizeOwnership = require("../middleware/ownership.middleware");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const { auditLog } = require("../utils/auditLogger");
const { getAllUsers } = require("../controllers/admin.controller");

//==================================================================================================
// AUTH ROUTES

// Create a new user account
router.post("/", validateCreateUser, createUser);

// Login user and issue tokens
router.post("/login",authLimiter,validateLoginUser,loginUser);

// Deprected: JWT-based refresh token (replaced by DB-backed refresh tokens)
// Refresh access token using refresh token
/* router.post(
    "/refresh-token",
    authLimiter,
    async (req, res)=>{
        const { refreshToken } = req.body;

        if(!refreshToken){
            return res.status(401).json({
                message:"Refresh token required"
            });
        }
        // console.log("Refresh token:", refreshToken);
        // console.log("Using secret:", process.env.JWT_REFRESH_SECRET);
        try{
            const decoded=jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );

            const newAccessToken = jwt.sign(
                { userId: decoded.userId },
                process.env.JWT_ACCESS_SECRET,
                { expiresIn: "15m" }
            );
            
            res.status(200).json({
                accessToken: newAccessToken
            });
            

        }catch(error){
            // console.log(error);
            return res.status(401).json({
                message:"Invalid or expired refresh token"
            });
        }
    }
);
*/



// Logout (client-side token discard)
router.post(
    "/logout",
    authenticate,
    (req, res)=>{
        res.status(200).json({
            message:"Logged out successfully. Please delete token on client."
        });
    }
);

//=================================================================================
//AUTHENTICATED USER CONTEXT

// Get currently logged-in user
router.get("/me",authenticate,(req,res)=>{
    res.status(200).json({
        message:"Access granted",
        user:req.user
    });
});

//================================================================================================
// ADMIN ROUTES (COLLECTION ACCESS)

// Test admin access (diagnostic)
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

// Get Pagination & filture list of users (admin only)
router.get(
    "/",
    authenticate,
    authorizeRoles("admin"),
    getAllUsers
);

//===============================================================================================
// USER PROFILE ROUTES (OWNERSHIP)

// Get user profile (self or admin)
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

// Update user profile (self or admin)
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

//=============================================================================================
// ACCOUNT SECURITY ROUTES

// Change password (self or admin)
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
            
            auditLog({
                userId: user.id,
                action: "PASSWORD_CHANGED",
                req
            });

            return res.status(200).json({
                message:"Password changed successfully"
            });
        }catch (error){
            next(error);
        }
    }
);


router.patch("/change-password",
    authenticate,
    changePassword
    
)



module.exports = router;