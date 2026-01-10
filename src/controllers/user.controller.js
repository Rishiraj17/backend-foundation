
const { createUserService } = require("../services/user.service");

const createUser = async (req, res, next)=>{
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
        next(error); // delegate to centralized error middleware
    }
    
};

module.exports={
    createUser
};