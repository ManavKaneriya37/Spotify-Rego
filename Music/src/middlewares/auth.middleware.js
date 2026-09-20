import jwt from "jsonwebtoken"
import config from "../config/config.js"

export async function authArtistMiddleware(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    try {
        const decodedToekn = jwt.verify(token, config.JWT_SECRET);
        if (decodedToekn.role !== "artist") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to perform this action"
            })
        }
        req.user = decodedToekn
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }


}