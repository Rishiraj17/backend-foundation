const User = require("../models/user.model");

const createUserService = async (name,email) =>{
    const user = new User({
        name,
        email
    });

    await user.save();

    return user;
};

module.exports={
    createUserService
};