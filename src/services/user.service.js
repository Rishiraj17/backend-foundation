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

    const isPasswordMatch = await bcrypt.compare(password,user.password);

    if(!isPasswordMatch){
        auditLog({
            userId: user._id,
            action:"LOGIN_FAILED",
            details:"INCORRECT password",
            req
        });

        const error=new Error("Invalid email or password");
        error.statusCode=401;
        throw error;
    }

    return user;
}

module.exports={
    createUserService,
    loginUserService
};