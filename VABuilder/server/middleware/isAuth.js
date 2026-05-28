import jwt from 'jsonwebtoken'

export const isAuth = async (req, res, next) => {
    try {
        let token = req.cookies?.token;

        if (!token && req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token || token === 'undefined' || token === 'null') {  
            return res.status(401).json({ message: 'Unavailable token' });
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = verifyToken.userId || verifyToken.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Authentication failed: ' + error.message });
    }
}