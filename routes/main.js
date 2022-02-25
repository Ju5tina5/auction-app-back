const express = require('express');
const middleWare = require('../middleware/middleWare');
const auctionMiddleWare = require('../middleware/auctionMiddleWare');
const router = express.Router();

const {loginUser, registerUser, logOutUser, decreaseUserMoney, updateUserAvatar} =  require('../controllers/userController');
const {getAllAuctions, getSingleAuction, addNewAuction, auctionEnd, auctionBidReceive, getAllUserBids, deleteAuction} = require('../controllers/auctionController');


//user paths
router.get('/logout', logOutUser);
router.post('/register', middleWare.validateUser, registerUser)
router.post('/login', middleWare.validateUser, loginUser)
router.post('/updateAvatar', middleWare.validateUserSession, updateUserAvatar)
// auction paths
router.get('/getAuctions', getAllAuctions)
router.get('/getSingleAuction/:id', getSingleAuction)
router.get('/getUserBids', middleWare.validateUserSession, getAllUserBids)
router.get('/deleteAuction/:id', middleWare.validateUserSession, deleteAuction)
router.get('/auctionEnded/:id', auctionEnd)
router.post('/addNewAuction', middleWare.validateUserSession,  auctionMiddleWare.validateAuctionData, addNewAuction)
router.post('/bidAction', middleWare.validateUserSession, auctionMiddleWare.validateBidAmount, decreaseUserMoney, auctionBidReceive)


module.exports = router;