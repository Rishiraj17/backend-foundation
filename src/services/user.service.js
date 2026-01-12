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

module.exports={
    createUserService
};