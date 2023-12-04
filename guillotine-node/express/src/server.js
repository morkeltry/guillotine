import express from 'express';
import 'path';
import cookieParser from 'cookie-parser';
import openSession from'../openSession.js';

const server = express();

server.set('port', process.env.PORT || 8000);

server.use(cookieParser());
// server.use('/', proxy);

server.use(openSession.get);

export default server;
