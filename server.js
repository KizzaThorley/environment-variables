require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose')
const methodOverride = require("method-override"); // new
const morgan = require("morgan"); //new
const path = require('path')

const port = process.env.PORT ? process.env.PORT : 3000;
const app = express();
const session = require('express-session')

const Snacks = require('./models/snacks.js')

const authController = require('./controllers/auth.js')

mongoose.connect(process.env.MONGODB_URI)

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
})
);
app.use((req, res, next) => {
    if (req.session.message) {
      res.locals.message = req.session.message;
      req.session.message = null;
    }
    next();
  });
  


app.use('/auth', authController);

app.get('/', (req, res) => {
    res.render('home.ejs', {
        user: req.session.user
    })

});



app.get('/snacks', async (req, res) => {
    const snacks = await Snacks.find()

    res.render('snacks.ejs', {
        snacks: snacks,
        user: req.session.user
    })
})

app.get('/snacks/:snackId', async (req, res) => {
    const snack = await Snacks.findById(req.params.snackId)
    const snackId = req.params.snackName
    res.render('snack.ejs', {
        snackId: snackId,
        snack: snack,
        user: req.session.user,
    })
})

app.get('/new-snack', (req, res) => {
    res.render('newsnacks.ejs', {
        user: req.session.user,
    })
})

app.get("/snack/:snackId/edit", async (req, res) => {
    const foundSnack = await Snacks.findById(req.params.snackId);
    res.render("snackedit.ejs", {
        snack: foundSnack,
        user: req.session.user,
    });
});



//! tell express to expect some json in the request 
app.use(express.json())

app.use(express.urlencoded({ extended: false }))

app.post('/snacks', async (req, res) => {
try {
    // let doesSnackExist = await Snacks.findOne({name: req.body.name});
// if (req.body.name === doesSnackExist.name) {
//     return res.send(`Snack exists`)
// } else {
    let newSnack = req.body
    

    if (newSnack.eaten === 'on') {
        newSnack.eaten = true
    } else {
        newSnack.eaten = false
    }

   await Snacks.create(newSnack)
   req.session.message = "Snack successfully created."
    res.redirect('/snacks')
// } 
} catch (err) {
    req.session.message = err.message;
    res.redirect('/snacks')
}
})

app.delete('/snacks', async (req, res) => {

    const snacks = await Snacks.deleteOne(req.body)

    res.send(snacks)
})
app.delete('/snacks/:snackId', async (req, res) => {
    const deletedSnack = await Snacks.findByIdAndDelete(req.params.snackId)

    res.redirect('/snacks')
})


// app.put('/snacks', async (req, res) => {
//     const snacks = await Snacks.updateOne(req.body, {rating: 2})

// res.redirect(``)

// })

// app.get('/snacks/:snackId', async (req, res) =>{
//     console.log(req.params.snackId);
// const snack = await Snacks.findById(req.params.snackId)


// res.send(snack)
// })


app.put('/snack/:snackId', async (req, res) => {

    if (req.body.eaten === "on") {
        req.body.eaten = true;
    } else {
        req.body.eaten = false;
    }

    await Snacks.findByIdAndUpdate(req.params.snackId, req.body);

    res.redirect(`/snacks/${req.params.snackId}`)

})

// app.get('/snacks/search/:snackName', async (req, res) => {
//     const snacks = await Snacks.find()
//     let matchedSnack = []
//    snacks.forEach( async (snack) =>{ 
//         if(snack.name === req.params.snackName) {
//          matchedSnack.push(snack)
//      } else return 
//     })
//     res.redirect(`/snack/${matchedSnack.id}`)

//    })


app.get('/vip-lounge', (req, res) => {
    if (req.session.user) {
        res.send(`Welcome to the VIP lounge ${req.session.user.username}`)
    } else {
        res.send('No Guests allowed')
    }
})


// this routes any 404 errors to a 404 error page
// app.get('*', function (req, res) {
//     res.render('error.ejs', { 
//         msg: 'Page not found!',
//         user: req.session.user,
//      });
//   });
app.get('*', function (req, res) {
    res.status(404).render('error.ejs', {
      msg: 'Route not found!',
      user: req.session.user,
    });
  });
  
  

app.listen(port, () => {
    console.log('Listening on port 3000');
});

