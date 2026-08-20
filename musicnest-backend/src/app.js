
const express = require('express'); //Import the express module to create an instance of the express application
const cors = require('cors');
const cookieParser = require('cookie-parser'); //Import the cookie-parser middleware to parse cookies from incoming requests
const authRoutes = require('./routes/auth.routes'); //Import the authentication routes module
const musicRoutes = require('./routes/music.routes')


const app = express(); //Create an instance of the express application

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json()); //Middleware to parse incoming JSON requests
app.use(cookieParser()); //Middleware to parse cookies from incoming requests
app.use('/api/auth', authRoutes); //use the authentication routes for any requests starting with '/api/auth'
app.use('/api/music', musicRoutes); //use the music routes for any requests starting with '/api/music'


//router.post('/register',)








module.exports = app; //Export the express application instance for use in other modules