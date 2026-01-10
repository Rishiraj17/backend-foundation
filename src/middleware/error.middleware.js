const errorHandler = (err,req,res,next)=>{
    //duplicate key error (MongoDB)
    if(err.code===11000){
        return res.status(409).json({
            message:"Email already exists"
        });
    }

    //default server error
    res.status(500).json({
        message:"Internal server error",
        error:err.message
    });
};

module.exports=errorHandler;