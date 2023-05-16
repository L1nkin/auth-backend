const Router = require('express');
const router = new Router();
const controller = require('./authController')
const { check } = require('express-validator')
const authMiddleware = require('./middlewares/authMiddleware')
const roleMiddleware = require('./middlewares/roleMiddleware')

router.post('/registration', [
    check('username', 'Username can not be empty').notEmpty(),
    check('password', 'Password must be longer then 4 symbols').isLength({ min: 4 })
], controller.registration)
router.post('/login', controller.login)
router.get('/users', roleMiddleware(['USER']), controller.getUsers)

module.exports = router;