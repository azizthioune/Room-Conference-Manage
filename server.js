const express = require('express');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');
const sessionRoutes = require('./routes/session.routes')
const hotelRoutes = require('./routes/hotel.routes')
const actuRoutes = require('./routes/actu.routes')
const notifRoutes = require('./routes/notif.routes')
const infoRoutes = require('./routes/info.routes')
require('dotenv').config({ path: './config/.env' });
require('./config/db')
const { checkUser, requireAuth } = require('./middleware/auth.middleware');

const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.static(__dirname + '/client/public'));

//jwt 
app.get('*', checkUser);
app.get('/jwtid', requireAuth, (req, res) => {
    res.status(200).send(res.locals.user._id)
});

// routes
app.use('/api/user', userRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/hotel', hotelRoutes);
app.use('/api/actu', actuRoutes);
app.use('/api/notif', notifRoutes);
app.use('/api/info', infoRoutes);

// server
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
}) 