const User = require("../models/user.model");

const validateCreateUser = async (req,res,next)=>{
    const { name, email, password } = req.body;

    if(!name||!email||!password){
        return res.status(400).json({
            message:"Name and email are required"
        });
    }

    // normalize data
    req.body.name = name.trim();
    req.body.email=email.trim().toLowerCase();
 
    // async validation: check if email already exists
    const existingUser = await User.findOne({ email });

    if(existingUser){
        return res.status(409).json({
            message: "Email already exists"
        });
    }

    //attach normalized data
    req.body.name=name;
    req.body.email=email;
    req.body.password=password;

    next();
};

const validateLoginUser = (req, res, next) =>{
    let { email, password } = req.body;

    if( !email || !password){
        return res.status(400).json({
            message:"Email and password are required"
        });
    }

    req.body.email = email.trim().toLowerCase();
    req.body.password = password;

    next();
};

const validateUpdateUser = (req, res, next)=> {
    const allowedFields = ["name","email"];
    const updates = Object.keys(req.body);

    const isValidOperation = updates.every((field) => allowedFields.includes(field));

    if(!isValidOperation){
        return res.status(400).json({
            message:"Invalid update field"
        });
    }

    //normalize if present
    if(req.body.email){
        req.body.email=req.body.email.trim().toLowerCase();
    }

    if(req.body.name){
        req.body.name = req.body.name.trim();
    }

    next();
};

module.exports={
    validateCreateUser,
    validateLoginUser,
    validateUpdateUser
};