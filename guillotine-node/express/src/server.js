import express from 'express';
import 'path';
import cookieParser from 'cookie-parser';
import openSession from'./openSession.js';

const server = express();

server.set('port', process.env.GUILLOTINE_PORT || 7000);

server.use(cookieParser());
// server.use('/', proxy);

server.get('/openSession', openSession.get);

export default server;
