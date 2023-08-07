const { Schema, model } = require('mongoose')
const Contact = require('./Contact')

const User = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    phoneNumber: { type: String, required: false, unique: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    contacts: [{ type: Schema.Types.Mixed, required: true, unique: true }],
    recentContacts: [{ type: Schema.Types.Mixed, required: true, unique: true }]
})

module.exports = model('User', User)