require('dotenv').config();

const express = require('express');
const mongoose= require('mongoose')

const port = 3000
const app = express();

const Snacks = require('./models/snacks.js') 

mongoose.connect(process.env.MONGODB_URL)


app.get('/', (req, res) => {
  res.send('The server is running');
});

app.get('/snacks', async (req, res) => {
 const snacks = await Snacks.find()
 console.log(snacks);
 res.send(snacks)
})
//! tell express to expect some json in the request 
app.use(express.json())

app.post('/snacks', async (req, res) => {
    console.log(req.body);

    // const snack = await Snacks.create(req.body)

    let doesSnackExist = await Snacks.exists({name: req.body.name});

    
console.log(doesSnackExist);


    if(doesSnackExist) {
      res.send('Already one of my snacks')
} else {
    const snack = await Snacks.create(req.body)
    res.send(snack)

    }


})

app.delete('/snacks', async (req, res) => {

const snacks = await Snacks.deleteOne(req.body)

res.send(snacks)
})


app.put('/snacks', async (req, res) => {
    const snacks = await Snacks.updateOne(req.body, {rating: 2})

    res.send(snacks)

})

app.get('/snacks/:snackId', async (req, res) =>{
    console.log(req.params.snackId);
const snack = await Snacks.findById(req.params.snackId)


res.send(snack)
})


app.put('/snacks/:snackId', async (req, res) => {
   console.log("hello");
const snack = await Snacks.findById(req.params.snackId)

let updatedSnack = await Snacks.updateOne(snack, req.body)

res.send(updatedSnack)
})


app.listen(port, () => {
  console.log('Listening on port 3000');
});

