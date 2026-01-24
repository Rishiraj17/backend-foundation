const { sendSuccess } = require("../utils/response");
const { getAdminUsers } = require("../services/admin.service");

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