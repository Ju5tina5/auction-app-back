const express = require('express');
const middleWare = require('../middleware/middleWare');
const router = express.Router();

const {loginUser, registerUser} =  require('../controllers/userController');

router.post('/register', middleWare.validateUser, registerUser)
router.post('/login', middleWare.validateUser, loginUser)


module.exports = router;