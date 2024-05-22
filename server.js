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

const authController = require('./controllers/auth.js');
const { ppid } = require('process');

mongoose.connect(process.env.MONGODB_URI)

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
})
);
app.use((req, res, next) => {
    if (req.session.message) {
        res.locals.message = req.session.message;
        req.session.message = null;
    }
    next();
});

app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
});



app.use('/auth', authController);

app.get('/', (req, res) => {
    try {
        res.render('home.ejs')
    } catch (error) {
        res.render('error.ejs', {
            error: error.message,
        })
    }

});



app.get('/snacks', async (req, res) => {
    try {
        const snacks = await Snacks.find()

        res.render('snacks.ejs', {
            snacks: snacks,
        })
    } catch (error) {
        res.render('error.ejs', {
            error: error.message,
        })
    }
})

app.get('/snacks/:snackId', async (req, res) => {
    try {
        const snack = await Snacks.findById(req.params.snackId)
        const snackId = req.params.snackName
        res.render('snack.ejs', {
            snackId: snackId,
            snack: snack,
        })
    } catch (error) {
        res.render('error.ejs', {
            error: error.message,
        })
    }
})

app.get('/new-snack', (req, res) => {
    if (req.session.user) {
        try {
            res.render('newsnacks.ejs')
        } catch (error) {
            res.render('error.ejs', {
                error: error.message,
            })
        }
    } else {
        res.redirect('auth/sign-in')
    }
})

app.get("/snack/:snackId/edit", async (req, res) => {
    if (req.session.user) {
        try {
            const foundSnack = await Snacks.findById(req.params.snackId);
            res.render("snackedit.ejs", {
                snack: foundSnack,
            });
        } catch (error) {
            res.render('error.ejs', {
                error: error.message,
            })
        }
    } else {
        res.redirect('auth/sign-in')
    }

});



//! tell express to expect some json in the request 
app.use(express.json())

app.use(express.urlencoded({ extended: false }))

app.post('/snacks', async (req, res) => {
    if (req.session.user) {
        try {
            if (!req.body.name.trim()) {
                throw new Error('invalid input; the name field cannot be empty')
            }
            if (!req.body.rating.trim()) {
                throw new Error('invalid input; the rating field cannot be empty')
            }
            if (!req.body.cost.trim()) {
                throw new Error('invalid input; the cost field cannot be empty')
            }
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
    } else {
        res.redirect('/auth/sign-in')
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



app.put('/snack/:snackId', async (req, res) => {
    try {
        if (req.body.eaten === "on") {
            req.body.eaten = true;
        } else {
            req.body.eaten = false;
        }
        if (!req.body.name.trim()) {
            throw new Error('invalid input; the name field cannot be empty')
        }
        if (!req.body.rating.trim()) {
            throw new Error('invalid input; the rating field cannot be empty')
        }
        if (!req.body.cost.trim()) {
            throw new Error('invalid input; the cost field cannot be empty')
        }
        await Snacks.findByIdAndUpdate(req.params.snackId, req.body);

        res.redirect(`/snacks/${req.params.snackId}`)
    } catch (err) {
        req.session.message = err.message;
        res.redirect(`/snack/${req.params.snackId}/edit`, {
            errorMessage: err.message,
        })
    }



});



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
    });
});



const handleServerError = (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Warning! Port ${port} is already in use!`);
    } else {
        console.log('Error:', err);
    }
}

app.listen(port, () => {
    console.log(`The express app is ready on port ${port}!`);
}).on('error', handleServerError);

