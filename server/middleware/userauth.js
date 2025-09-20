import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }

    try {
        const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);

        if (tokenDecoded.id) {
            if (!req.body) req.body = {};
            req.userId = tokenDecoded.id;
            return next();
        } else {
            return res.json({ success: false, message: "Token is not valid" });
        }
    } catch (error) {
        return res.json({ success: false, message: "Token is not valid" });
    }
}

export default userAuth;