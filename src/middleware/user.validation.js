const validateCreateUser = async (req,res,next)=>{
    const { name, email } = req.body;

    if(!name||!email){
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

    next();
};

module.exports={
    validateCreateUser
};