const User = require("../models/user.model");
const { createUserService } = require("../services/user.service");

const createUser = async (req,res)=>{
    try{
        const { name,email }= req.body;

        //basic validation
        if(!name || !email){
            return res.status(400).json({
                message:"Name and email are required"
            });
        }

        const user = await createUserService(name, email);

        res.status(201).json({
            message:"User created successfully",
            user
        });
    } catch(error){
        //duplicate email error
        if(error.code===11000){
            return res.status(409).json({
                message:"Email already exists"
            });
        }

        res.status(500).json({
            message:"Error creating user",
            error: error.message
        });
    }
    
};

module.exports={
    createUser
};