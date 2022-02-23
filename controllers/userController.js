const bcrypt = require('bcrypt');
const userSchema = require('../models/userSchema');

module.exports = {
    loginUser: async (req, res) => {
        const {user_name, password} = req.body;
        const userExists = await userSchema.findOne({user_name})
        if (!userExists) return res.send({success: false, message: "bad credentials"})
        const passMatch = await bcrypt.compare(password, userExists.password)
        if (passMatch) {
            req.session.user = userExists.user_name
            req.session.save();
            return res.send({success: true, message: "Successfully logged in"})
        }
        res.send({success: false, message: "bad credentials"})
    },
    registerUser: async (req, res) => {
        const {user_name, password} = req.body;

        const userExists = await userSchema.findOne({user_name})
        if (userExists) return res.send({success: false, message: "User is already taken"})

        const user = new userSchema();
        user.user_name = data.user_name;
        user.password = bcrypt.hash(data.password, 10);
        await user.save();

        res.send({success: true, message: 'User registered'})
    },
    logOutUser: (req, res) => {
        req.session.destroy( () => {
            res.send({success: true})
        })
    },
    decreaseUserMoney: async (req, res, next) => {
        const {amount} = req.body;
        const {user_name} = req.session;
        await userSchema.findOneAndUpdate({user_name}, {$inc: {money: -amount}})
        next();
    }
}

