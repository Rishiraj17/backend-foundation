const { loginUserService } = require("../services/user.service");
const { auditLog } = require("../utils/auditLogger");
const { sendSuccess } = require("../utils/response");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/refreshToken.model");

const loginUser = async (req, res, next) =>{
    try{
        const { email, password } = req.body;
        
        const user=await loginUserService(email,password,req);
        const userId = user._id;
        const activeSessions = await RefreshToken.find({ userId, revokedAt: null}).sort({ createdAt: 1 });

        const MAX_SESSIONS = 5;

        if(activeSessions.length>=MAX_SESSIONS){
            const numberToRevoke = activeSessions.length - MAX_SESSIONS + 1;
            const sessionsToRevoke = activeSessions.slice(0,numberToRevoke);

            for(const session of sessionsToRevoke){
                session.revokedAt = new Date();
                await session.save();
            }
        }

        const accessToken = jwt.sign(
            { userId },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = crypto.randomBytes(64).toString("hex");

        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate()+7);

        const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

        await RefreshToken.create({
            userId,
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


const refreshAccessToken = async (req, res, next) =>{
    try{
        const { refreshToken } = req.body;

        if(!refreshToken) {
            return res.status(401).json({
                message:"Refresh token required"
            });
        }

        const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const tokenDoc = await RefreshToken.findOne({
            token: hashedRefreshToken,
            revokedAt: null
        });

        if(!tokenDoc){
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }

        if(tokenDoc.expiresAt< new Date()){
            return res.status(401).json({
                message: "Refresh token expired"
            });
        }

        const accessToken = jwt.sign(
            { userId: tokenDoc.userId },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: "15m" }
        );
        
        const newRefreshToken = crypto.randomBytes(64).toString("hex");

        const newHashedRefreshToken = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    
        tokenDoc.revokedAt = new Date();
        await tokenDoc.save();

        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate()+7);

        await RefreshToken.create({
            userId: tokenDoc.userId,
            token: newHashedRefreshToken,
            expiresAt: newExpiry
        });

        sendSuccess(res, 200, "Token refreshed",{
            accessToken,
            refreshToken: newRefreshToken
        });

    }catch(error){
        next(error);
    }
};

const logout = async (req, res, next) => {
    try{
        const { refreshToken } = req.body;

        if(!refreshToken){
            return res.status(401).json({
                message:"Refresh token required"
            });
        }

        const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const tokenDoc = await RefreshToken.findOne({
            token: hashedRefreshToken,
            revokedAt: null
        });

        if(!tokenDoc){
            return res.status(401).json({
                message:"Invalid refresh token"
            });
        }

        tokenDoc.revokedAt = new Date();
        await tokenDoc.save();

        sendSuccess(res, 200, "Logged out");

    }catch(error){
        next(error);
    }
};

module.exports ={
    loginUser,
    refreshAccessToken,
    logout
};