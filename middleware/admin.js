const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");
const admin = require("../routes/admin");

function adminMiddleware(req,res,next){
    const token = req.headers.token;
    if(!token){
        return res.status(401).json({
            message: "No token provided"
        });
    }

    try{
        const decoded = jwt.verify(token , JWT_ADMIN_PASSWORD);
        req.userId = decoded.id;
        next();
    }catch (err){
        return res.status(401).json({
            message: "Invalid token"
        });
    }
}

module.exports={
    adminMiddleware: adminMiddleware
}