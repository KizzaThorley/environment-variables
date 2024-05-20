const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const User = require('../models/user.js')


router.get("/sign-up", (req, res) => {
    res.render('auth/sign-up.ejs', {
        user: req.session.user
    })
});

router.post('/sign-up', async (req,res) => {

const userInDatabase = await User.findOne({ username: req.body.username});
if(userInDatabase) { 
    return res.send('Username Already taken.')
}

if(req.body.password !== req.body.confirmPassword){
    res.send('Passwords dont match.')
} 

const hasUpperCase = /[A-Z]/.test(req.body.password);
if (!hasUpperCase){
    return res.send('Password must contain at least one uppercase letter')
}

if(req.body.password.length < 8) {
    return res.send("Password must be at least 8 characters long")
}

const hashedPassword = bcrypt.hashSync(req.body.password, 10)

req.body.password = hashedPassword
const user = await User.create(req.body);

res.send(`thanks for signing up ${user.username}`);


});

router.get('/sign-in', (req, res) => {
    res.render('auth/sign-in.ejs', {
        user: req.session.user
    });
})


router.post('/sign-in', async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username });
   
    if (!userInDatabase) {
        return res.send("Login failed, Please try again.")
    } 
  
  
    const validPassword = bcrypt.compareSync(req.body.password, userInDatabase.password);
    if (!validPassword) {
        return res.send("Login failed, Please try again.");
    }

    req.session.user = {
        username: userInDatabase.username,
    };

    res.redirect('/')
    
});

router.get('/sign-out', (req, res) => {
    req.session.destroy();
    res.redirect('/')
})

module.exports = router;

