const authorizeRoles = (...allowedRole) =>{
    return (req, res, next)=>{
        //check user is attached by auth middleware
        if(!req.user || !req.user.role){
            return res.status(403).json({
                message:"Access denied"
            });
        }

        //check role is allowed
        if(!allowedRole.includes(req.user.role)){
            return res.status(403).json({
                message:"You don not have permission to perform this action"
            });
        }

        next();
    };
};

module.exports=authorizeRoles;