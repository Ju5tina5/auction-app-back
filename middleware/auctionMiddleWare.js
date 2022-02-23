const auctionSchema = require('../models/auctionSchema');

module.exports = {
    validateAuctionData: (req, res, next) => {
        const {picture, title, start_Price, end_time} = req.body;

        if(!picture.includes('http')) return res.send({success: false, message: 'Picture link not provided'})
        if(title.length < 20) return res.send({success: false, message: 'Title too short'})
        if(title.length < 500) return res.send({success: false, message: 'Title too long'})
        if(typeof start_Price !== 'number') return res.send({success: false, message: 'Price should be a number'})
        if(end_time.getMonth() && end_time > Date.now()) return res.send({success: false, message: 'Price should be a number'})
        next()
    },
    validateBidAmount: async (req, res, next) => {
        const {id: _id, amount} = req.body;
        if(!Number(amount)) return res.send({success: false, message: 'Bid Amount should be a number'});
        const auction = await auctionSchema.findOne({_id});
        if(auction.bids.find(x => x.price === amount)) return res.send({success: false, message: "Bid amount already exists"})
        const bid_amounts = auction.bids( x => {
            return x.price
        })
        let prevHighest = Math.max(...bid_amounts);
        if(prevHighest > amount) return res.send({success: false, message: "Bid amount is less than highest bid"})
        next();
    }
}