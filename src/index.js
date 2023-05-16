const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRouter.js');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use('/auth', authRouter);
const start = async () => {
    try {
        await mongoose.connect(`mongodb+srv://wpanalex:qweqwe123@cluster0.u9z8ujx.mongodb.net/auth?retryWrites=true&w=majority`)
        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
        });
    } catch (err) {
        console.log(err);
    }
}

start();