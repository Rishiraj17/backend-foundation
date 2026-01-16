const authorizeOwnership = (paramKey) =>{
    return (req, res, next) => {
        const resourceOwnerId=req.params[paramKey];

        if(!req.user){
            return res.status(401).json({
                message:"Unauthorized"
            });
        }
    

        //Admin can access anything
        if(req.user.role === "admin"){
            return next();
        }

        //Check ownership
        if(req.user._id.toString() !== resourceOwnerId){
            return res.status(403).json({
                message:"You do not have permission to access this resource"
            });
        }

        next();
    };
};

module.exports = authorizeOwnership;