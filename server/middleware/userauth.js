import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        // Always log in production for debugging (can remove later)
        console.log('Auth middleware - Request origin:', req.headers.origin);
        console.log('Auth middleware - Cookies received:', Object.keys(req.cookies));
        console.log('Auth middleware - Token present:', !!token);
        console.log('Auth middleware - Cookie header:', req.headers.cookie);

        if (!token) {
            console.log('Auth failed: No token in cookies');
            return res.status(401).json({ success: false, message: "No token, authorization denied" });
        }

        const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);

        if (tokenDecoded.id) {
            if (!req.body) req.body = {};
            req.userId = tokenDecoded.id;
            return next();
        } else {
            console.log('Auth failed: Token decoded but no id');
            return res.status(401).json({ success: false, message: "Token is not valid" });
        }
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({ success: false, message: "Token is not valid" });
    }
}

export default userAuth;