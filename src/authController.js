const User = require('./models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { secret } = require('./config');

const generateAccessToken = (id, username) => {
    const payload = {
        id,
        username
    }

    return jwt.sign(payload, secret, { expiresIn: '24h' });
}

class authController {
    async registration(req, res) {
        try {
            const { username, password, firstName, lastName, phoneNumber } = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const candidate = await User.findOne({ username });
            if (candidate) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            const user = new User({ username, password: hashPassword, firstName: firstName, lastName: lastName, phoneNumber: phoneNumber });
            await user.save();
            const token = generateAccessToken(user._id, user.usename);
            return res.status(200).json({ success: true, data: { token: token } });
        } catch (error) {
            res.status(400).json({ success: false, message: 'Registration error' });
        }
    }

    async login(req, res) {
        try {
            const { username, phoneNumber, password } = req.body;
            let user
            if (username) {
                user = await User.findOne({ username });
            } else if (phoneNumber) {
                user = await User.findOne({ phoneNumber });
            }
            if (!user) {
                return res.status(400).json({ success: false, message: 'User not found' });
            }
            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ success: false, message: 'Invalid password' });
            }
            const token = generateAccessToken(user._id, user.usename);
            return res.status(200).json({ success: true, data: { token: token } });

        } catch (error) {
            res.status(400).json({ success: false, message: 'Login error' });
        }
    }

    async getUsers(req, res) {
        try {
            const users = await User.find();
            let mapUsers = users.map((user) => {
                user.__v = undefined
                return user
            })
            return res.status(200).json({ success: true, data: { users: mapUsers } });
        } catch (error) {
            res.status(400).json({ success: false, message: 'Something went wrong' });
        }
    }

    async addContact(req, res) {
        try {
            const { username } = req.body;
            console.log(username);
            const user = await User.findOne({ username: username });
            if (!user) {
                return res.status(400).json({ success: false, message: 'User not found' });
            }
            let currentUser = await User.findOne({ _id: req.user.id })
            console.log(currentUser)
            if (currentUser.contacts.some(contact => contact.username === user.username)) {
                return res.status(400).json({ success: false, message: 'Contact already exists' })
            }
            user.__v = undefined
            currentUser.contacts = [...currentUser.contacts, { ...user }]
            currentUser.save()
            return res.status(200).json({ success: true })

        } catch (error) {
            res.status(400).json({ success: false, message: 'Something went wrong' });
        }
    }

    async setNames(req, res) {
        try {
            const { firstName, lastName } = req.body;
            let currentUser = await User.findOne({ _id: req.user.id })
            currentUser.firstName = firstName
            currentUser.lastName = lastName
            currentUser.__v = undefined
            currentUser.save()
            return res.status(200).json({ success: true })
        } catch (error) {
            res.status(400).json({ success: false, message: 'Something went wrong' });
        }
    }

    async getContacts(req, res) {
        try {
            const currentUser = await User.findOne({ _id: req.user.id })
            let contactsList = []
            for (let contact in currentUser.contacts) {
                let user = await User.findOne({ _id: currentUser.contacts[contact]._id })
                console.log(user)
                contactsList.push({ username: user.username, firstName: user.firstName, lastName: user.lastName, _id: user._id })
            }
            return res.status(200).json({ success: true, data: { contactsList } });
        } catch (error) {
            res.status(400).json({ message: 'Something went wrong' });
        }
    }

    async getUserData(req, res) {
        try {
            const { username } = req.query
            const user = await User.findOne({ username: username })
            if (user) {
                user.__v = undefined
                res.status(200).json({ success: true, data: { user } })
            } else {
                res.status(400).json({ success: false, message: "User not found" })
            }
        } catch {
            res.status(400).json({ success: false, message: "Something went wrong" })
        }
    }
}

module.exports = new authController();