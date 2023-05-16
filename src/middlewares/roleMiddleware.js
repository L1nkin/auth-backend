const { secret } = require('../config')
const jwt = require('jsonwebtoken')

module.exports = function (roles) {
    return function (req, res, next) {
        if (req.method === 'OPTIONS') {
            next()
        }

        try {
            const token = req.headers.authorization.split(' ')[1]
            if (!token) {
                return res.status(403).json({ message: 'User is not authorized' })
            }
            const { roles: userRoles } = jwt.verify(token, secret)
            let hasRole = false
            for (let role in userRoles) {
                if (roles.includes(userRoles[role])) {
                    hasRole = true
                    break
                }
            }
            if (!hasRole) {
                return res.status(403).json({ message: 'You do not have a access' })
            }
            next()
        } catch (err) {
            return res.status(403).json({ message: 'User is not authorized' })
        }
    }
}