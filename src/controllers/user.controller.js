
const { createUserService } = require("../services/user.service");
const { loginUserService } = require("../services/user.service");
const { auditLog } = require("../utils/auditLogger");
const { sendSuccess } = require("../utils/response");
const jwt =require("jsonwebtoken");
const crypto = require("crypto");
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

const loginUser = async (req, res, next) =>{
    try{
        const { email, password } = req.body;
        
        const user=await loginUserService(email,password,req);

        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = crypto.randomBytes(64).toString("hex");

        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate()+7);

        const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

        await RefreshToken.create({
            userId: user._id,
            token: hashedRefreshToken,
            expiresAt: refreshTokenExpiry
        });
        
        auditLog({
            userId: user._id,
            action: "LOGIN_SUCCESS",
            req
        });

        sendSuccess(
            res,
            200,
            "Login successful",
            { accessToken, refreshToken }
        );

    } catch(error){
        next(error);
    }
} 

module.exports={
    createUser,
    loginUser
};