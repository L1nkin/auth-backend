const { secretRefreshToken } = require('../config')
const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    if (req.method === 'OPTIONS') {
        next()
    }

    try {
        const refreshToken = req.headers.authorization.split(' ')[1]
        if (!refreshToken) {
            return res.status(403).json({ message: 'User is not authorized' })
        }
        const decodeData = jwt.verify(refreshToken, secretRefreshToken)
        req.user = decodeData
        next()
    } catch (err) {
        return res.status(403).json({ message: 'User is not authorized' })
    }
}