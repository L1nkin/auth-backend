const { Schema, model } = require('mongoose')

const Contact = new Schema({
    phoneNumber: { type: String, required: true, unique: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    isFavorite: { type: Boolean, required: true }
})

module.exports = model('Contact', Contact)