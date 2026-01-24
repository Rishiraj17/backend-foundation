const User = require("../models/user.model");

const getAdminUsers = async ({
    page = 1,
    limit = 1,
    sortBy = "createdAt",
    order = "desc",
    role,
    email
}) =>{
    
    if(page<=0 || limit <= 0){
        const error = new Error("Page and limit must be positive numbers.");
        error.statusCode = 400;
        throw error;
    }     

    if(order && !["asc","desc"].includes(order)){
        const error = new Error("Order must be either 'asc' or 'desc'");
        error.statusCode = 400;
        throw error;
    }

    const skip = (page-1)*limit;
            
    const allowedSortFields = ["createdAt","name","email","role"];

    // let sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    if(sortBy && !allowedSortFields.includes(sortBy)){
        const error = new Error(`Invalid sortBy field. Allowed fields: ${allowedSortFields.join(", ")}`);
        error.statusCode = 400;
        throw error;
    }

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