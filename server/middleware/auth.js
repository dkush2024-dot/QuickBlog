import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({success: false, message: "No authorization token provided"});
        }

        // Extract token from "Bearer <token>" format
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({success: false, message: "Invalid token format. Use 'Bearer <token>'"});
        }

        jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch(error) {
        return res.status(401).json({success: false, message: "Invalid or expired token"});
    }
};

export default auth;