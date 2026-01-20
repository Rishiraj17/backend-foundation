const sanitize = (obj) => {
    if(!obj || typeof obj !== "object") return obj;

    for(const key in obj){
        if(key.startsWith("$") || key.includes(".")){
            delete obj[key];
        }
        else{
            obj[key]=sanitize(obj[key]);
        }
    }
    return obj;
};

const sanitizeBody = (req, res, next)=>{
    if(req.body) req.body = sanitize(req.body);
    next();
};

module.exports = sanitizeBody;