const { sendError } = require("../utils/response");

const errorHandler = (err,req,res,next)=>{
    //duplicate key error (MongoDB)
    if(err.code===11000){
        return sendError(
            res,
            409,
            "Email already exists",
            process.env.NODE_ENV === "development"? err:null
        );
    }

    //default server error
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    
    sendError(
        res,
        statusCode,
        message,
        process.env.NODE_ENV === "development" ? err.stack : null
    );
};

module.exports=errorHandler;