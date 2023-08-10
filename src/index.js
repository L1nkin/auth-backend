const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRouter.js');
const bodyParser = require('body-parser')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
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