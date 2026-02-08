const jwt = require('jsonwebtoken');
const BusinessUser = require('../models/BusinessUser');

/**
 * Middleware to verify business user token
 */
const verifyBusinessToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ status: 'fail', message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await BusinessUser.findById(decoded.id);

        if (!user || user.role !== 'business') {
            return res.status(401).json({ status: 'fail', message: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('verifyBusinessToken error:', error);
        res.status(401).json({ status: 'fail', message: 'Invalid token' });
    }
};

module.exports = {
    verifyBusinessToken
};
