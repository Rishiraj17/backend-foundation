const User = require("../models/user.model");
const AppError = require("../utils/appError");

// Service responsibility:
// - enforce business rules
// - validate inputs
// - interact with database
// - throw meaningful operational errors

const getAdminUsers = async ({
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
    role,
    email
}) =>{
    
    if(!Number.isFinite(page) || !Number.isFinite(limit) || page <= 0 || limit <= 0){
        throw new AppError("Page and limit must be positive numbers", 400);
    }     

    if(order && !["asc","desc"].includes(order)){
        throw new AppError("Order must be either 'asc' or 'desc'",400);
    }

    const skip = (page-1)*limit;
            
    const allowedSortFields = ["createdAt","name","email","role"];

    if(sortBy && !allowedSortFields.includes(sortBy)){
        throw new AppError(
            `Invalid sortBy field. Allowed fields: ${allowedSortFields.join(", ")}`,
            400
        );
    }

    let sortField = sortBy || "createdAt";
    let sortOrder = order === 'asc' ? 1 : -1;

    
    const sort = { [sortField]: sortOrder };

    const query = {};

    if(role){
        query.role=role;
    }

    if(email){
        query.email=email.toLowerCase();
    }

    const users = await User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("-password");

    const totalUsers = await User.countDocuments(query);

    return {
        page,
        limit,
        totalUsers,
        users
    };
};

module.exports={
    getAdminUsers
};