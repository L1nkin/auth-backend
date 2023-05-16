const { Schema, model } = require('mongoose')

const User = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    contacts: [{ type: { id: String, username: String }, required: true, unique: true }]

})

module.exports = model('User', User)