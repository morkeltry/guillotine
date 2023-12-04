import express from 'express';
import 'path';
import cookieParser from 'cookie-parser';
import forwardRequest from'../forwardRequest.js';

const server = express();

server.set('port', process.env.LOCAL_GUILLOTINE_PORT || 6000);

server.use(cookieParser());
// server.use('/', proxy);

server.use('/request', openSession.get);

export default server;
