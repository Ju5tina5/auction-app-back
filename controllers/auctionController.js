const auctionSchema = require('../models/auctionSchema');
const userSchema = require('../models/userSchema');

module.exports = {
    getAllAuctions: async (req, res) => {
        try {
            const auctions = await auctionSchema.find();
            return res.send({success: true, auctions})
        } catch (e) {
            return res.send({success: false, message: e})
        }
    },
    getSingleAuction: async (req, res) => {
        const {id: _id} = req.params;
        try {
            const auction = await auctionSchema.findOne({_id})
            res.send({success: true, auction})
        } catch (e) {
            return res.send({success: false, message: e})
        }
    },
    addNewAuction: async (req, res) => {
        const {picture, title, start_Price, end_time} = req.body;
        const {user_name} = req.session;
        try {
            const auction = new auctionSchema();
            auction.owner_name = user_name;
            auction.picture = picture;
            auction.title = title;
            auction.start_Price = start_Price;
            auction.end_time = end_time;

            await auction.save();

            return res.send({success: true, auction})
        } catch (e) {
            return res.send({success: false, message: e})
        }
    },
    auctionBidReceive: async (req, res) => {
        const {id: _id, amount} = req.body;
        const {user_name} = req.session;

        const bid = {
            user_name,
            price: amount,
            bid_time: Date.now()
        }

        let auction = await auctionSchema.findOneAndUpdate({_id}, {$push: {bids: bid}}, {new: true});

        if(auction.start_Price < amount){
            auction = await auctionSchema.findOneAndUpdate({_id}, {$set: {start_Price: amount}}, {new: true});
        }

        return  res.send({success: true, auction})

    },
    auctionEnd: async (req, res) => {
        const {id: _id} = req.params;
        const auction = await auctionSchema.findOneAndUpdate({_id}, {$set: {isEnded: true}}, {new: true});

        res.send({success: true, auction})
    }
}
