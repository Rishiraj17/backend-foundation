const User = require("../models/user.model");

const createUser = async (req,res)=>{
    try{
        const { name,email }= req.body;

        const user=new User({
            name,
            email

        });

        await user.save();

        res.status(201).json({
            message:"User created successfully",
            user
        });
    } catch(error){
        res.status(500).json({
            message:"Error creating user",
            error: error.message
        });
    }
    
};

module.exports={
    createUser
};