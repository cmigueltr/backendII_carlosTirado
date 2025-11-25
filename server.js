import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import { engine } from 'express-handlebars';
import passport from 'passport';

import connectDB from './src/config/db.js';
import initPassport from './src/config/passport.js';
import sessionsRouter from './src/routes/sessions.routes.js';
import usersRouter from './src/routes/users.routes.js';

const app = express();

// Initialize app
async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // middlewares
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(express.static('public'));

    // handlebars
    app.engine('handlebars', engine());
    app.set('view engine', 'handlebars');
    app.set('views', './src/views');

    // passport
    initPassport();
    app.use(passport.initialize());

    // routes
    app.use('/api/sessions', sessionsRouter);
    app.use('/api/users', usersRouter);

    // simple page routes for auth views
    app.get('/', (req, res) => res.redirect('/login'));
    app.get('/register', (req, res) => res.render('register'));
    app.get('/login', (req, res) => res.render('login'));
    app.get('/profile', passport.authenticate('current', { session: false }), (req, res) => {
      res.render('profile', { user: req.user });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();
