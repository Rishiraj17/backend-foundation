const { sendSuccess } = require("../utils/response");
const User = require("../models/user.model");
const getAllUsers = async (req, res, next ) =>{
    try{
        const page = parseInt(req.query.page)||1;
        const limit = parseInt(req.query.limit)||10;
        
        const skip = (page-1)*limit;
            
        const allowedSortFields = ["createdAt","name","email","role"];

        let sortField = req.query.sortBy || "createdAt";
        let sortOrder = req.query.order === 'asc' ? 1 : -1;

        if(!allowedSortFields.includes(sortField)){
            sortField = "createdAt";
        }

        const sort = { [sortField]: sortOrder };

        const query = {};

        if(req.query.role){
            query.role=req.query.role;
        }

        if(req.query.email){
            query.email=req.query.email.toLowerCase();
        }

        const users = await User.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select("-password");

        const totalUsers = await User.countDocuments(query);

        sendSuccess(
            res,
            200,
            "Users fetched successfully",
            {
                page,
                limit,
                totalUsers,
                users
            }
        );
    }
    catch(error){
        next(error);
    }
};

module.exports = {
    getAllUsers
};