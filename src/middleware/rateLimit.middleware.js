const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                    // 5 request per window
    message:{
        message:"Too many attempts. Please try again later."
    },
    standardHeaders : true,
    legacyHeader: false
});

module.exports = {
    authLimiter
};