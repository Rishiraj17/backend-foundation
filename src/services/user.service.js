const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const { auditLog } = require("../utils/auditLogger");

const createUserService = async (name, email, password) =>{
    // hash password
    const hashedPassword = await bcrypt.hash(password,10);

    const user = new User({
        name,
        email,
        password: hashedPassword
    });

    await user.save();

    return user;
};

const loginUserService = async(email,password,req)=>{
    const user = await User.findOne({email});

    if(!user){
        auditLog({
            userId:null,
            action:"LOGIN_FAILED",
            details:"Email not found",
            req
        });

        const error = new Error("Invalid email or password");
        error.statusCode=401;
        throw error;
    }

    if(user.accountStatus !== "active"){
        const error = new Error("Account is not active");
        error.statusCode = 403;
        throw error;
    }

    if(user.lockUntil && user.lockUntil > Date.now()){
        const error = new Error("Account temporarily locked, Try again later.");
        error.statusCode=401;
        throw error;
    }

    const isPasswordMatch = await bcrypt.compare(password,user.password);

    if(!isPasswordMatch){
        auditLog({
            userId: user._id,
            action:"LOGIN_FAILED",
            details:"INCORRECT password",
            req
        });

        user.failedLoginAttempts += 1;
        user.lastFailedLoginAt = new Date();

        if(user.failedLoginAttempts >= 5 ){
            user.failedLoginAttempts = 0;
            user.lockUntil = new Date(Date.now()+ 15*60*1000);
           
            await user.save();

            const error = new Error("Account temporarily locked, Try again later.");
            error.statusCode=401;
            throw error;
        }

        await user.save();

        const error=new Error("Invalid email or password");
        error.statusCode=401;
        throw error;
    }

    if(user.failedLoginAttempts>0 || user.lastFailedLoginAt || user.lockUntil){
        user.failedLoginAttempts=0;
        user.lastFailedLoginAt=null;
        user.lockUntil=null;

        await user.save();

        auditLog({
            userId: user._id,
            action: "LOGIN_RECOVERY",
            details: "LOGIN_AFTER_FAILURE_RESET",
            req
        });

    }

    return user;
}

module.exports={
    createUserService,
    loginUserService
};