require('dotenv').config();

const mongoose = require('mongoose')

const Snack = require('./models/snacks.js')

// this is a program totally separate to express that is going to put some data into out database 

// it needs to know the shape of your collections and documents to talk to the database 
// e.g movies.create

async function seed() {
    console.log('seeding has begun!');
    await mongoose.connect(process.env.MONGODB_URL)
    console.log('connection succesefull ');

    console.log(process.env.MONGODB_URL);

    const snack = await Snack.create({
        name: 'popcorn',
        rating: 5,
        cost: 1,
        eaten: true 
    })

    console.log(snack);
             
    mongoose.disconnect()
    console.log('disconected');
}



seed()