
const { createUserService } = require("../services/user.service");
const { loginUserService } = require("../services/user.service");
const { auditLog } = require("../utils/auditLogger");
const jwt =require("jsonwebtoken");

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

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d"}
        );
        
        auditLog({
            userId: user._id,
            action: "LOGIN_SUCCESS",
            req
        });

        res.status(200).json({
            message:"Login successful",
            accessToken,
            refreshToken
        });

    } catch(error){
        next(error);
    }
} 

module.exports={
    createUser,
    loginUser
};