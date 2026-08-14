const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided', code: 'UNAUTHORIZED' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId }
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Not authorized, token failed', code: 'UNAUTHORIZED' });
    }
};
