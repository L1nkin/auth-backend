const { secret } = require('../config')
const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    if (req.method === 'OPTIONS') {
        next()
    }

    try {
        const accessToken = req.headers.authorization.split(' ')[1]
        if (!accessToken) {
            return res.status(403).json({ message: 'User is not authorized' })
        }
        const decodeData = jwt.verify(accessToken, secret)
        req.user = decodeData
        next()
    } catch (err) {
        return res.status(403).json({ message: 'User is not authorized' })
    }
}