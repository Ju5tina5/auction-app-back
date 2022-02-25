const auctionSchema = require('../models/auctionSchema');
const userSchema = require('../models/userSchema');

module.exports = {
    getAllAuctions: async (req, res) => {
        try {
            const auctions = await auctionSchema.find();
            let sortedAuctions = [];
            for (let i = 0; i < auctions.length; i++) {
                if(auctions[i].isEnded){
                    sortedAuctions.push(auctions[i])
                }else{
                    sortedAuctions.unshift(auctions[i])
                }
            }
            return res.send({success: true, sortedAuctions})
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
    getAllUserBids: async (req, res) => {
        const {user_name} = req.session;
        let bids = [];
        const auctions = await auctionSchema.find({}, { title: 1, bids: 1 });
        await auctions.map( x =>
            x.bids.map( y => {
                if(y.user_name === user_name){
                    bids.push({auction_title: x.title, bid: y})
                }
            })
        )
        res.send({success: true, bids})
    },
    deleteAuction: async (req, res) => {
        const {id: _id} = req.params;
        const removedAuction = await auctionSchema.findOneAndDelete({_id});
        res.send({success: true, removedAuction})
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

            return res.send({success: true, message: 'Auction successfully published'})
        } catch (e) {
            return res.send({success: false, message: e})
        }
    },
    auctionBidReceive: async (req, res) => {
        const {_id, amount} = req.body;
        const {user_name} = req.session;

        const bid = {
            user_name,
            price: Number(amount),
            bid_time: Date.now()
        }

        const auction = await auctionSchema.findOneAndUpdate({_id}, {$push: {bids: bid}, $set: {start_Price: bid.price}}, {new: true});

        if(auction.bids.length > 1){
            let prevHighest = auction.bids[auction.bids.length - 2];
            await userSchema.findOneAndUpdate({user_name: prevHighest.user_name}, {$inc: {money: prevHighest.price}}, {new: true});
        }

        const user_money = await userSchema.findOne({user_name}, {money: 1})

        return  res.send({success: true, auction, user_money})
    },
    auctionEnd: async (req, res) => {
        const {id: _id} = req.params;
        const endedAuction = await auctionSchema.findOneAndUpdate({_id}, {$set: {isEnded: true}}, {new: true});
        if(endedAuction.bids.length > 0){
            let oldMoney = await userSchema.findOne({user_name: endedAuction.owner_name}, {money: 1})
            let money = await oldMoney.money + endedAuction.start_Price;
            await userSchema.findOneAndUpdate({user_name: endedAuction.owner_name}, {$set: {money: Number(money)}});
            console.log(oldMoney)
            console.log(endedAuction.start_Price)
            console.log(money)
        }
        const auctions = await auctionSchema.find();
        res.send({success: true, auctions})
    }
}
