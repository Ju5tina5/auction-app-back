const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const auctionSchema = new Schema({
    owner_name: {
        type: String,
        required: true,
    },
    picture: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    start_Price: {
        type: Number,
        required: true
    },
    end_time: {
        type: Date,
        required: true,
    },
    bids: {
        type: Array,
        required: true,
        default: []
    },
    isEnded: {
        type: Boolean,
        required: true,
        default: false
    }
})


module.exports = mongoose.model('auctionSchema', auctionSchema);