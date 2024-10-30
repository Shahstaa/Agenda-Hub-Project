const dotenv = require('dotenv')
dotenv.config()
const express = require('express');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const addUserToViews = require('./middleware/addUserToViews');
require('dotenv').config();
require('./config/database');
const fileUpload = require('express-fileupload');

// Controllers
const authController = require('./controllers/auth');
const activityController = require('./controllers/activity');
const isSignedIn = require('./middleware/isSignedIn');
const addUserToViewsUserToView = require('./middleware/addUserToViews');

const app = express();
const port = process.env.PORT ? process.env.PORT : '3000';
const path = require('path');


// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride('_method'));
// Morgan for logging HTTP requests
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);
app.use(addUserToViews);
app.use(fileUpload());

// Public Routes
app.get('/', async (req, res) => {
 res.render('index.ejs' , {
   user: req.session.user,
 });
});

app.use('/auth', authController);
// Protected Routes
app.use('/activities', isSignedIn, activityController);

app.get('/activities/new', (req, res) => {
  res.render('activities/new.ejs');
});

app.get('/activities/:id', async (req, res) => {
  const activity = await activity.findById(req.params.id);
  res.render('activities/show.ejs', { activity });
});

app.get('/activities/:id/edit', async (req, res) => {
  const activity = await activity.findById(req.params.id);
  res.render('activities/edit.ejs', { activity });
});

app.delete('/activities/:id', async (req, res) => {
  await Activity.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

// app.get('/summary', async (req, res) => {
//   const activity = await activity.find({ userId: req.session.user ? req.session.user._id : null });
//   // Summary logic can be added here
//   res.render('activities/summary.ejs', { activity });
// });


app.get('/protected', async (req, res) => {
  if (req.session.user) {
    res.send(`Welcome to Your Agenda Hub ${req.session.user.username}.`);
  } else {
    res.sendStatus(404);
    // res.send('Sorry, no guests allowed.');
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`The express app is ready on port ${port}!`);
});
