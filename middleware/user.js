const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config");
const user = require("../routes/user");

function userMiddleware(req,res,next){
    const token = req.headers.token;
    if(!token){
        return res.status(401).json({
            message: "No token provided"
        });
    }

    try{
        const decoded = jwt.verify(token , JWT_USER_PASSWORD);
        req.userId = decoded.id;
        next();
    }catch (err){
        return res.status(401).json({
            message: "Invalid token"
        });
    }
}

module.exports={
    userMiddleware: userMiddleware
}