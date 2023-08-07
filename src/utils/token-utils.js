const jwt = require('jsonwebtoken');
const { secret, secretRefreshToken } = require('../config');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client();
const { clientIdApplication } = require('../config')

const generateAccessToken = (id, username) => {
    const payload = {
        id,
        username
    }
    return jwt.sign(payload, secret, { expiresIn: '1h' });
}

const generateRefreshToken = (id, username) => {
    const payload = {
        id,
        username
    }

    return jwt.sign(payload, secretRefreshToken, { expiresIn: '30d' });
}

async function verifyGoogleToken(token) {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientIdApplication
    });
    const payload = ticket.getPayload();
    return payload;
}

module.exports = { generateAccessToken, generateRefreshToken, verifyGoogleToken }