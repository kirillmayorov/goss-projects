import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import crypto from 'crypto';
import runner from "./server/app.js";
import {createReadStream} from 'fs'
import mongoose from 'mongoose';
import cors from './cors.js';
import user_model from './models/user.js';

try {
    const port = process.env.PORT || 3000;
    const user = user_model(mongoose);
    const app = runner(express, bodyParser, createReadStream, crypto, http, mongoose, user, cors);
    app.listen(port);
    console.log(`server is listening at http://localhost:${port}`);
} catch (error) {
    console.log(error);
}