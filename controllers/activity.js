/* 
const express = require('express');
const Activity = require('../models/activity');
const router = express.Router();

// Index - Show all activities
router.get('/', async (req, res) => {
    const activities = await Activity.find({ userId: req.session.user._id });
    const totalDuration = activities.reduce((total, activity) => total + activity.duration, 0);
    res.render('activities/index.ejs', { activities, totalDuration });
});

// Show 
router.get('/:id', async (req, res) => {
    const activity = await Activity.findById(req.params.id);
    res.render('activities/show.ejs', { activity });
});

// New
router.get('/new', (req, res) => {
    res.render('activities/new.ejs');
});

// Create - Add a new activity
router.post('/', async (req, res) => {
    req.body.userId = req.session.user._id;
    await Activity.create(req.body);
    res.redirect('/index.ejs');
});

// Edit - Show form to edit an activity
router.get('/edit/:id', async (req, res) => {
    const activity = await Activity.findById(req.params.id);
    res.render('activities/edit.ejs', { activity });
});

// Update activity
router.put('/:id', async (req, res) => {
    await Activity.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/activities');
});

// Delete - Delete an activity
router.delete('/:id', async (req, res) => {
    await Activity.findByIdAndDelete(req.params.id);
    res.redirect('/activities');
});

// Summary - Show analytics of activities
router.get('/summary', async (req, res) => {
    const activities = await Activity.find({ userId: req.session.user._id });
    const totalDuration = activities.reduce((total, activity) => total + activity.duration, 0);
    res.render('activities/summary.ejs', { activities, totalDuration });
});

module.exports = router;
*/
const path = require('path');
const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const isSignedIn = require('../middleware/isSignedIn');
router.use(isSignedIn);

router.get('/', async (req, res) => {
    try {
      const currentUser = await User.findById(req.session.user._id);
      res.render('activities/index.ejs', {
        activity : currentUser.activity,
        user: currentUser
      });
    } catch (error) {
      console.log(error)
      res.redirect('/')
    }
});

router.get('/new', (req, res) => {
    res.render('activities/new.ejs', { user: req.session.user });
});

router.post('/', async (req, res) => {
    try {
      const currentUser = await User.findById(req.session.user._id);
      req.body.date = new Date(req.body.date);
      currentUser.activity.push(req.body);
      await currentUser.save();
      res.redirect('activities');
    } catch (error) {
      console.log(error);
      res.redirect('/activities')
    }
});

router.get('/profile', async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id).populate('activity');
    console.log(currentUser);  
    res.render('activities/profile.ejs', { user: currentUser });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.post('/profile/update', async (req, res) => {
  const currentUser = await User.findById(req.session.user._id);
  
  // Handle email update
  if (req.body.email) {
      currentUser.email = req.body.email;
  }

  // Handle file upload
  if (req.files && req.files.profilePicture) {
      const file = req.files.profilePicture;
      const uploadPath = path.join(__dirname, '../uploads', file.name);
      
      // Move the file
      fs.rename(file.path, uploadPath, (err) => {
          if (err) {
              console.error(err);
              return res.redirect('/profile');
          }
          currentUser.profilePictureUrl = uploadPath; // Save the new profile picture path
          currentUser.save();
      });
  }

  res.redirect('/activities/profile');
});

// router.post('/profile/update', async (req, res) => {
//   try {
//       const currentUser = await User.findById(req.session.user._id);
//       currentUser.email = req.body.email; // Update email
//       await currentUser.save();
//       res.redirect('/activities/profile'); // Redirect to profile page
//   } catch (error) {
//       console.log(error);
//       res.redirect('/activities/profile'); // Redirect in case of error
//   }
// });

// router.get('/summary', async (req, res) => {
//   const activity = await User.findById(req.session.user._id);
//   const totalDuration = activity.reduce((total, activity) => total + activity.duration, 0);
//   res.render('activities/summary.ejs', { activity, totalDuration });
// });
router.get('/summary', async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id).populate('activity'); // Ensure activities are populated
    const totalDuration = currentUser.activity.reduce((total, activity) => total + activity.duration, 0);

    res.render('activities/summary.ejs', { activities: currentUser.activity, totalDuration });
  } catch (error) {
    console.log(error);
    res.redirect('/activities');
  }
});

router.get('/:activityId', async (req, res) => {
    try {
      const currentUser = await User.findById(req.session.user._id);
      const activity = currentUser.activity.id(req.params.activityId);
      res.render('activities/show.ejs', {
        activity: activity,
        user: currentUser
      });
    } catch (error) {
      console.log(error);
      res.redirect('/')
    }
});

router.delete('/:activityId', async (req, res) => {
    try {
      const currentUser = await User.findById(req.session.user._id);
      currentUser.activity.id(req.params.activityId).deleteOne();
      await currentUser.save();
      res.redirect('/activities');
    } catch (error) {
      console.log(error);
      res.redirect('/')
    }
});

router.get('/:activityId/edit', async (req, res) => {
    try {
      const currentUser = await User.findById(req.session.user._id);
      const activity = currentUser.activity.id(req.params.activityId);
      res.render('activities/edit.ejs', {
        activity: activity,
      });
    } catch (error) {
      console.log(error);
      res.redirect('/')
    }
});

// UPDATE route: Handle the edit form submission
router.put('/:activityId', async (req, res) => {
  try {
      const currentUser = await User.findById(req.session.user._id);
      const activity = currentUser.activity.id(req.params.activityId);
      if (currentUser._id.equals(req.session.user._id)) {
          req.body._id = activity._id
          activity.set(req.body)
          await currentUser.save();
          res.redirect('/activities');
      } else {
          res.send("You don't have permission to update this item.");
      }
  } catch (error) {
      console.error(error);
      res.redirect('/activities');
  }
});

// Profile Route
// router.get('/profile', async (req, res) => {
//   try {
//     const currentUser = await User.findById(req.session.user._id);
//     res.render('activities/profile.ejs', { user: currentUser });
//   } catch (error) {
//     console.log(error);
//     res.redirect('/');
//   }
// });


module.exports = router;









