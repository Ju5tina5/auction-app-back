const { createServer } = require("http");
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const router = require('./routes/main');
require('dotenv').config();
const socketIo = require("socket.io");
const server = createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(express.json());
server.listen(4000);

app.use((req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))


// use socket io
app.use((req, res, next) => {
    req.io = io;
    return next();
});

mongoose.connect(process.env.DATABASE_CONNECT)
    .then(res => {
        console.log('Connected to DB')
    }).catch(e => {
    console.log(e)
})

app.use('/', router);

