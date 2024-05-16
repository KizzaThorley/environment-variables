
const mongoose = require('mongoose')

const snackSchema = new mongoose.Schema({
    name: { type: String, required: true},
    rating: { type: Number, required: true},
    cost: { type: Number, required: true},
    eaten: { type: Boolean, required: true},
})              


module.exports = mongoose.model('Snack', snackSchema)