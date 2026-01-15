const bcrypt = require("bcrypt");
const User = require("../models/user.model");

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

const loginUserService = async(email,password)=>{
    const user = await User.findOne({email});

    if(!user){
        const error = new Error("Invalid email or password");
        error.statusCode=401;
        throw error;
    }

    const isPasswordMatch = await bcrypt.compare(password,user.password);

    if(!isPasswordMatch){
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