const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const openSession = require('./openSession');

const app = express();

app.set('port', process.env.PORT || 8000);

app.use(cookieParser());
// app.use('/', proxy);

app.use(openSession);

module.exports = server;
