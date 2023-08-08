const User = require('./models/User');
const Contact = require('./models/Contact');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { generateAccessToken, generateRefreshToken, verifyGoogleToken } = require('./utils/token-utils')

class authController {
    async registration(req, res) {
        try {
            const { username, password, firstName, lastName, phoneNumber } = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const candidateUsername = await User.findOne({ username });
            const candidatePhoneNumber = await User.findOne({ phoneNumber });
            if (candidateUsername) {
                return res.status(400).json({ success: false, message: 'User with the same username already exists' });
            }
            if (candidatePhoneNumber) {
                return res.status(400).json({ success: false, message: 'User with the same phone already exists' });
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            const user = new User({ username, password: hashPassword, firstName: firstName, lastName: lastName, phoneNumber: phoneNumber });
            await user.save();
            const accessToken = generateAccessToken(user.id, user.username);
            const refreshToken = generateRefreshToken(user.id, user.username);
            return res.status(200).json({ success: true, data: { accessToken: accessToken, refreshToken: refreshToken }});
        } catch (error) {
            res.status(400).json({ success: false, message: 'Registration error' });
        }
    }

    async registrationByGoogle(req, res) {
        try {
            const { tokenId } = req.body
            const googleUser = await verifyGoogleToken(tokenId)
            const user = new User({ username: googleUser.email, firstName: googleUser.given_name, lastName: googleUser.family_name});
            const candidateUsername = await User.findOne({ username: user.username });
            if (candidateUsername) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }
            user.save()
            const accessToken = generateAccessToken(user.id, user.username);
            const refreshToken = generateRefreshToken(user.id, user.username);
            return res.status(200).json({ success: true, data: { accessToken: accessToken, refreshToken: refreshToken }});
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message })
        }
    }

    async loginByGoogle(req, res) {
        try {
            const { tokenId } = req.body
            const googleUser = await verifyGoogleToken(tokenId)
            const user = await User.findOne({ username: googleUser.email });
            if (!user) {
                return res.status(400).json({ success: false, message: 'User not found' });
            }
            const accessToken = generateAccessToken(user.id, user.username);
            const refreshToken = generateRefreshToken(user.id, user.username);
            return res.status(200).json({ success: true, data: { accessToken: accessToken, refreshToken: refreshToken }});
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message })
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
            const accessToken = generateAccessToken(user.id, user.username);
            const refreshToken = generateRefreshToken(user.id, user.username);
            return res.status(200).json({ success: true, data: { accessToken: accessToken, refreshToken: refreshToken }});

        } catch (error) {
            res.status(400).json({ success: false, message: 'Login error' });
        }
    }

    async updateAccessToken(req, res) {
        try {
            const currentUser = await User.findOne({ _id: req.user.id })
            const accessToken = generateAccessToken(currentUser.id, currentUser.username);
            res.status(200).json({ success: true, data: { accessToken: accessToken }});
        } catch (error) {
            res.status(400).json({ success: false, message: 'Something went wrong' });
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
            const user = await User.findOne({ username: username });
            if (!user) {
                return res.status(400).json({ success: false, message: 'User not found' });
            }
            let currentUser = await User.findOne({ _id: req.user.id })
            if (currentUser.contacts.some(contact => contact._id.toString() === user.id)) {
                return res.status(400).json({ success: false, message: 'Contact already exists' })
            }
            if (currentUser._id.toString() === user.id) {
                return res.status(400).json({ success: false, message: "You can not add yourself!" })
            }
            user.__v = undefined
            let newContact = new Contact({ _id: user.id, phoneNumber: user.phoneNumber, firstName: user.firstName, lastName: user.lastName, isFavorite: false})
            currentUser.contacts = [...currentUser.contacts, newContact]
            currentUser.markModified('contacts')
            currentUser.save()
            return res.status(200).json({ success: true, message: "User was add" })

        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
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

    async addPhoneNumber(req, res) {
        try {
            const { phoneNumber } = req.body
            const user = await User.findOne({ _id: req.user.id })
            user.phoneNumber = phoneNumber
            user.save()
            return res.status(200).json({ success: true, user: user })
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getContacts(req, res) {
        try {
            const currentUser = await User.findOne({ _id: req.user.id })
            return res.status(200).json({ success: true, data: { contacts: currentUser.contacts } });
        } catch (error) {
            res.status(400).json({ success: false, message: 'Something went wrong' });
        }
    }

    async getUserData(req, res) {
        try {
            const user = await User.findOne({ _id: req.user.id })
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

    async checkUsers(req, res) {
        try {
            const query = req.query.searchText.toLowerCase()
            const users = await User.find()
            const searchedUsers = [...users].filter((user) => user.username.toLowerCase().startsWith(query))
            return res.status(200).json({ success: true, data: { searchedUsers } })
        } catch(error) {
            return res.status(400).json({ success: false, message: error.message })
        }
    }

    async addToFavorites(req, res) {
        try {
            const currentUser = await User.findOne({ _id: req.user.id })
            currentUser.contacts.find(contact => {
                if (contact._id.toString() === req.user.id) {
                    contact.isFavorite = !contact.isFavorite
                }
            })
            currentUser.markModified('contacts')
            currentUser.save()
            res.status(200).json({ success: true })
        } catch {
            res.status(400).json({ success: false, message: "Something went wrong" })
        }
    }

    async addToRecents(req, res) {
        try {
            let currentUser = await User.findOne({ _id: req.user.id })
            for (const contact of currentUser.contacts) {
                if (contact._id.toString() === req.user.id) {
                    currentUser.recentContacts.unshift({ date: new Date(), contact: contact })
                }
            }
            if (currentUser.recentContacts.length > 3) {
                currentUser.recentContacts.pop()
            }
            currentUser.markModified('recentContacts')
            currentUser.save()
            res.status(200).json({ success: true })
        } catch {
            return res.status(400).json({ success: false, message: "Something went wrong" })
        }
    }
}

module.exports = new authController();