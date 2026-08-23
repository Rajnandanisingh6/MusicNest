const express = require('express'); //Import the express module to create an instance of the express application
const cors = require('cors');
const morgan = require('morgan'); //har request ko console mein log karega (dev ke liye helpful)
const cookieParser = require('cookie-parser'); //Import the cookie-parser middleware to parse cookies from incoming requests
const authRoutes = require('./routes/auth.routes'); //Import the authentication routes module
const musicRoutes = require('./routes/music.routes')


const app = express(); //Create an instance of the express application

app.use(morgan('dev'));

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // .env se aayega, deploy karte waqt yahi change karna padega
    credentials: true
}));
app.use(express.json()); //Middleware to parse incoming JSON requests
app.use(cookieParser()); //Middleware to parse cookies from incoming requests
app.use('/api/auth', authRoutes); //use the authentication routes for any requests starting with '/api/auth'
app.use('/api/music', musicRoutes); //use the music routes for any requests starting with '/api/music'


module.exports = app; //Export the express application instance for use in other modules