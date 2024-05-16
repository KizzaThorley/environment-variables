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

    const snack = await Snacks.create(req.body)
    res.send(snack)
})

app.listen(port, () => {
  console.log('Listening on port 3000');
});

