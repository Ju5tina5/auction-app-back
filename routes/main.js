const express = require('express');
const middleWare = require('../middleware/middleWare');
const auctionMiddleWare = require('../middleware/auctionMiddleWare');
const router = express.Router();

const {loginUser, registerUser, logOutUser, decreaseUserMoney} =  require('../controllers/userController');
const {getAllAuctions, getSingleAuction, addNewAuction, auctionEnd, auctionBidReceive} = require('../controllers/auctionController');
const {route} = require("express/lib/router");

//user paths
router.get('/logOut', logOutUser);
router.post('/register', middleWare.validateUser, registerUser)
router.post('/login', middleWare.validateUser, loginUser)
// auction paths
router.get('/getAuctions', getAllAuctions)
router.get('/getSingleAuction/:id', getSingleAuction)
router.get('/auctionEnded/:id', auctionEnd)
router.post('/addNewAuction', middleWare.validateUserSession,  auctionMiddleWare.validateAuctionData, addNewAuction)
router.post('/bidAction', middleWare.validateUserSession, auctionMiddleWare.validateBidAmount, decreaseUserMoney, auctionBidReceive)


module.exports = router;