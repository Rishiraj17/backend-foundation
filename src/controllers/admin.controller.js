const { sendSuccess } = require("../utils/response");
const { getAdminUsers } = require("../services/admin.service");
const { auditLog } = require("../utils/auditLogger");

// Controller responsibility:
// - Parse and default request input
// - delegate business logic to service
// - format success response

const getAllUsers = async (req, res, next ) =>{
    try{
        const page = req.query.page === undefined ? 1 : Number(req.query.page);
        const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

        const result = await getAdminUsers({
            page,
            limit,
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