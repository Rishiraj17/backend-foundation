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

    //Operational erros are expected (validation, auth, etc.)
    //Non-operational errors indicate bugs or system failures

    //default server error
    const statusCode = err.statusCode || 500;
    const message = err.isOperational === true ? err.message : "Internal server error";
    const isDev = process.env.NODE_ENV === undefined || process.env.NODE_ENV === "development";

    sendError(
        res,
        statusCode,
        message,
         isDev ? err.stack : null
    );
};

module.exports=errorHandler;