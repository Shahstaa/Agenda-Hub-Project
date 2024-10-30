const fs = require('fs');
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
    // console.log(currentUser);  
    res.render('activities/profile.ejs', { user: currentUser });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.post('/profile', async (req, res) => {
  try {

    const query = {_id: req.session.user._id}
    const update = {profilePicture: req.body.profilePicture}
    console.log(update)
    await User.findByIdAndUpdate(query, update)
      // Handle file upload
      // if (req.files && req.files.profilePicture) {
          // const file = req.files.profilePicture;
          // const uploadPath = path.join(__dirname, 'activity', file.name);
          // Move the file and save path to the user
          // await fs.promises.rename(file.path, uploadPath);
          // currentUser.profilePictureUrl = req.body.profilePicture; // Save the new profile picture path
      // }
      // Save user after making changes
      // console.log(currentUser); 
      // await currentUser.save();
      res.redirect('/activities/profile');
  } catch (error) {
      console.error("Error updating profile:", error);
      res.redirect('/activities/profile');
  }
});

// router.get('/summary', async (req, res) => {
//   try {
//     const currentUser = await User.findById(req.session.user._id).populate('activity'); // Ensure activities are populated
//     const totalDuration = currentUser.activity.reduce((total, activity) => total + activity.duration, 0);

//     res.render('activities/summary.ejs', { activities: currentUser.activity, totalDuration });
//   } catch (error) {
//     console.log(error);
//     res.redirect('/activities');
//   }
// });
router.get('/summary', async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id).populate('activity');
    
    // Group activities by date
    const activitiesByDate = {};
    currentUser.activity.forEach(activity => {
      const date = activity.date.toDateString(); // Use toDateString() for a readable format
      if (!activitiesByDate[date]) {
        activitiesByDate[date] = [];
      }
      activitiesByDate[date].push(activity);
    });

    const totalDuration = currentUser.activity.reduce((total, activity) => total + activity.duration, 0);
    
    res.render('activities/summary.ejs', { activitiesByDate, totalDuration });
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


module.exports = router;









