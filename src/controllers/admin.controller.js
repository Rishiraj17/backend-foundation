const { sendSuccess } = require("../utils/response");
const { getAdminUsers } = require("../services/admin.service");
const { auditLog } = require("../utils/auditLogger");

const getAllUsers = async (req, res, next ) =>{
    try{
        const result = await getAdminUsers({
            page : parseInt(req.query.page) || 1,
            limit : parseInt(req.query.limit) || 10,
            sortBy : req.query.sortBy,
            order : req.query.order,
            role : req.query.role,
            email : req.query.email

        });
        
        auditLog({
            userId: req.user?.id,
            action: "ADMIN_USERS_LIST_FETCHED",
            details: {
                page: result.page, 
                limit: result.limit, 
                sortBy: result.sortBy, 
                order: req.query.order, 
                role: req.query.role, 
                email: req.query.email
            },
            req
        });    

        sendSuccess(
            res,
            200,
            "Users fetched successfully",
            result
        );
    }
    catch(error){
        next(error);
    }
};

module.exports = {
    getAllUsers
};