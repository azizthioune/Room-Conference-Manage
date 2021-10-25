const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config({path: './config/.env'});
require('./config/db')

const cors = require('cors');
const app = express();
                    

// server
app.listen(process.env.PORT, ()=> {
    console.log(`Listening on port ${process.env.PORT}`);
} )