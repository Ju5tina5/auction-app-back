const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    user_name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    money: {
        type: Number,
        required: true,
        default: 1000
    }
})

module.exports = mongoose.model('userSchema', userSchema)