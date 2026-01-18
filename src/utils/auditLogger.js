const auditLog = ({ userId, action, details, req }) =>{
    const logEntry = {
        timestamp : new Date().toISOString(),
        userId: userId || "anonymous",
        action,
        ip: req?.ip,
        userAgent: req?.headers["user-agent"],
        details: details || null
    };

    console.log("AUDIT_LOG:", JSON.stringify(logEntry));
};

module.exports = {
    auditLog
};