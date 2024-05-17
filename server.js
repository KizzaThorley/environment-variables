require('dotenv').config();

const express = require('express');
const mongoose= require('mongoose')
const methodOverride = require("method-override"); // new
const morgan = require("morgan"); //new
const path = require('path')

const port = 3000
const app = express();

const Snacks = require('./models/snacks.js') 

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method")); 
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")))

mongoose.connect(process.env.MONGODB_URL)


app.get('/', (req, res) => {
    res.render('home.ejs')
 
});



app.get('/snacks', async (req, res) => {
 const snacks = await Snacks.find()
 
 res.render('snacks.ejs', {
snacks: snacks
 })
})

app.get('/snacks/:snackId', async (req, res) => {
    const snack = await Snacks.findById(req.params.snackId)
const snackId = req.params.snackName
    res.render('snack.ejs', {
        snackId: snackId,
        snack: snack
    })
})

app.get('/new-snack', (req, res) => {
    res.render('newsnacks.ejs')
})

app.get("/snack/:snackId/edit", async (req, res) => {
    const foundSnack = await Snacks.findById(req.params.snackId);
    res.render("snackedit.ejs", {
      snack: foundSnack,
    });
  });
  


//! tell express to expect some json in the request 
app.use(express.json())

app.use(express.urlencoded({ extended: false}))

app.post('/snacks', async (req, res) => {
    console.log(req.body);
    // let doesSnackExist = await Snacks.exists({name: req.body.name});
    let newSnack = req.body

if(newSnack.eaten === 'on') {
    delete newSnack.eaten
    newSnack.eaten = true
} else {
    delete newSnack.eaten
    newSnack.eaten = false
}

const snack = await Snacks.create(newSnack)
//     if(doesSnackExist) {
//       res.send('Already one of my snacks')
// } else {
//     const snack = await Snacks.create(req.body)
//     res.send(snack)

//     }
res.redirect('/snacks')

})

app.delete('/snacks', async (req, res) => {

const snacks = await Snacks.deleteOne(req.body)

res.send(snacks)
})
app.delete('/snacks/:snackId' , async (req, res) => {
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

   

app.listen(port, () => {
  console.log('Listening on port 3000');
});

