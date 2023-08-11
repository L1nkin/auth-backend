const { Schema, model } = require('mongoose')

const Contact = new Schema({
    username: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    isFavorite: { type: Boolean, required: true },
    imageString: { type: String, required: false },
})

module.exports = model('Contact', Contact)