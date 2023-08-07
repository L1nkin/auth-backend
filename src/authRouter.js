const Router = require('express');
const router = new Router();
const controller = require('./authController')
const { check } = require('express-validator')
const authMiddleware = require('./middlewares/authMiddleware')
const refreshMiddleware = require('./middlewares/refreshMiddleware')

// Post requests

router.post('/registration', [
    check('username', 'Username can not be empty').notEmpty(),
    check('password', 'Password must be longer then 4 symbols').isLength({ min: 4 }),
    check('phoneNumber', 'Phone number can not be empty').notEmpty()
], controller.registration)

router.post('/login', controller.login)

router.post('/registrationByGoogle', controller.registrationByGoogle)

router.post('/loginByGoogle', controller.loginByGoogle)

router.post('/addPhoneNumber', authMiddleware, controller.addPhoneNumber)

router.post('/addContact', authMiddleware, controller.addContact)

router.post('/setNames', authMiddleware, controller.setNames)

router.post('/updateAccessToken', refreshMiddleware, controller.updateAccessToken )

router.post('/addToFavorites', authMiddleware, controller.addToFavorites)

router.post('/addToRecents', authMiddleware, controller.addToRecents)

// Get requests

router.get('/getContacts', authMiddleware, controller.getContacts)

router.get('/getUserData', authMiddleware, controller.getUserData)

router.get('/users', controller.getUsers)


module.exports = router;