const Router = require('express');
const router = new Router();
const controller = require('./authController')
const { check } = require('express-validator')
const authMiddleware = require('./middlewares/authMiddleware')

router.post('/registration', [
    check('username', 'Username can not be empty').notEmpty(),
    check('password', 'Password must be longer then 4 symbols').isLength({ min: 4 })
], controller.registration)

router.post('/login', controller.login)

router.get('/users', controller.getUsers)

router.post('/addContact', authMiddleware, controller.addContact)

router.post('/setNames', authMiddleware, controller.setNames)

router.get('/getContacts', [
    check('firstName', 'Firstname can not be empty').notEmpty(),
    check('lastName', 'Lastname can not be empty').notEmpty()
], authMiddleware, controller.getContacts)

router.get('/getUserData', authMiddleware, controller.getUserData)

module.exports = router;