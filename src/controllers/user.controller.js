
const { createUserService } = require("../services/user.service");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { auditLog } = require("../utils/auditLogger");
const RefreshToken = require("../models/refreshToken.model");

const createUser = async (req, res, next)=>{
    try{
        const { name, email, password }= req.body;

        const user = await createUserService(name, email, password);

        res.status(201).json({
            message:"User created successfully",
            user
        });
    } catch(error){
        next(error); // delegate to centralized error middleware
    }
    
};

const changePassword = async ( req, res, next )=>{
    try{
        if(!req.user || !req.user._id){
            return res.status(401).json({
                message:"Unauthorized"
            });
        }

        const { oldPassword, newPassword } = req.body;
        
        const userId = req.user._id;
    
        const user= await User.findById(userId);

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }

        const isMatch = await bcrypt.compare(oldPassword,user.password);

        if(!isMatch){
            return res.status(401).json({
                message:"Old password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        const activeSessions = await RefreshToken.find({ userId, revokedAt: null });

        for(const session of activeSessions){
            session.revokedAt = new Date();
            await session.save();
        }

        auditLog({
            userId,
            action: "PASSWORD_CHANGE",
            req
        });

        return res.status(200).json({
            message:"Password changed successfully"
        });

    }catch(error){
        next(error);
    }
}

module.exports={
    createUser,
    changePassword
};