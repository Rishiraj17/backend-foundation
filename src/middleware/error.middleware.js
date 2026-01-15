const errorHandler = (err,req,res,next)=>{
    //duplicate key error (MongoDB)
    if(err.code===11000){
        return res.status(409).json({
            message:"Email already exists"
        });
    }

    //default server error
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        message:
            statusCode === 500 ? "Internal server error" : err.message,
        error: err.message
    });
};

module.exports=errorHandler;