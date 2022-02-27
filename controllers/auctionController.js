const auctionSchema = require('../models/auctionSchema');
const userSchema = require('../models/userSchema');
const schedule = require('node-schedule');

module.exports = {
    getAllAuctions: async (req, res) => {
        try {
            const auctions = await auctionSchema.find();
            let sortedAuctions = [];
            // sorting all auction so active auctions appear in front
            for (let i = 0; i < auctions.length; i++) {
                if (auctions[i].isEnded) {
                    sortedAuctions.push(auctions[i])
                } else {
                    sortedAuctions.unshift(auctions[i])
                }
            }
            //Emitting all auctions to all connected sockets
            req.io.emit('allAuctions', {sortedAuctions})
            return  res.send({success: true})
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
        //getting title and bids from all auctions
        const auctions = await auctionSchema.find({}, {title: 1, bids: 1});
        //mapping auctions
        await auctions.map(x =>
           // mapping current auction bids
            x.bids.map(y => {
                if (y.user_name === user_name) {
                    // pushing bid and auction title to bids array if sessions user name matches bidder user_name
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

            let createAuction;

            auction.save().then(res => {
                createAuction = res
            });

            // after creating new auction scheduling job for auction end_time
            const job = schedule.scheduleJob(end_time, async function () {
                //getting auction and setting than it's ended
                await auctionSchema.findOneAndUpdate({_id: createAuction._id}, {$set: {isEnded: true}});
                if (auction.bids.length > 0) {
                    //if auction had bids getting finished auction owner and adding highest bid amount to his money
                    let oldMoney = await userSchema.findOne({user_name: auction.owner_name}, {money: 1})
                    let money = await oldMoney.money + auction.start_Price;
                    await userSchema.findOneAndUpdate({user_name: auction.owner_name}, {$set: {money: Number(money)}});
                }
            })
            return res.send({success: true, message: 'Auction successfully published'})
        } catch (e) {
            return res.send({success: false, message: 'Error' + e.log})
        }
    },
    auctionEnd: async (req, res) => {
        const {id: _id} = req.params;
        //getting finished auction data, to set modal at front end
        const finishedAuction = await auctionSchema.findOne({_id});
        const auctions = await auctionSchema.find();
        return res.send({success: true, auctions, finishedAuction})
    },
    auctionBidReceive: async (req, res) => {
        const {_id, amount} = req.body;
        const {user_name} = req.session;

        const bid = {
            user_name,
            price: Number(amount),
            bid_time: Date.now()
        }

        // pushing new bid and setting new current_price
        const auction = await auctionSchema.findOneAndUpdate({_id}, {
            $push: {bids: bid},
            $set: {start_Price: bid.price}
        }, {new: true});

        //returning previous highest bidders money to his account
        if (auction.bids.length > 1) {
            let prevHighest = await auction.bids[auction.bids.length - 2];
            await userSchema.findOneAndUpdate({user_name: prevHighest.user_name}, {$inc: {money: prevHighest.price}}, {new: true});
        }

        const user = await userSchema.findOne({user_name}, {money: 1, user_name: 1, avatar: 1}, {new: true})
        res.send({success: true, user});
        // emitting new bid to all connected io's
        return req.io.emit("dibAdded", {auction})
    },
}
