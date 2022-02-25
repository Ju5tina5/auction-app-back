const auctionSchema = require('../models/auctionSchema');

module.exports = {
    validateAuctionData: (req, res, next) => {
        const {picture, title, start_Price, end_time} = req.body;
        if(!picture.includes('http')) return res.send({success: false, message: 'Picture link not provided'})
        if(title.length < 20) return res.send({success: false, message: 'Title too short'})
        if(title.length > 500) return res.send({success: false, message: 'Title too long'})
        if(typeof start_Price !== 'number') return res.send({success: false, message: 'Price should be a number'})
        if(Number(start_Price) <= 0) return res.send({success: false, message: `Starting Price can't be zero or below`})
        if( Date.parse(end_time) && (end_time + Date.now()) < Date.now()) return res.send({success: false, message: "End time can't be in the past"})
        next()
    },
    validateBidAmount: async (req, res, next) => {
        const { _id, amount} = req.body;
        if(!Number(amount)) return res.send({success: false, message: 'Bid Amount should be a number'});
        const auction = await auctionSchema.findOne({_id});
        let currentHighest = auction.start_Price;
        if(Number(currentHighest) === Number(amount)) return res.send({success: false, message: "Bid amount already exists"})
        if(currentHighest > amount) return res.send({success: false, message: "Bid amount is less than highest bid"})
        next();
    }
}