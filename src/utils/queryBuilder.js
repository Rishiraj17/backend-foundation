const buildPaginationAndSort = ({
    page,
    limit,
    sortBy,
    order,
    allowedSortFields,
    defaultSortField = "createdAt"
}) => {
    if(!Number.isFinite(page) || !Number.isFinite(limit)){
        throw new Error("buildPaginationAndSort expects validated numric inputs");
    }
    
    const skip = (page - 1) * limit;
    const sortField = sortBy || defaultSortField;
    const sortOrder = order === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder};
    
    return {
        skip, limit, sort
    };
};

module.exports = {
    buildPaginationAndSort
};