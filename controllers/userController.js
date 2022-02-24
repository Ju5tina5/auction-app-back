const bcrypt = require('bcrypt');
const userSchema = require('../models/userSchema');

module.exports = {
    loginUser: async (req, res) => {
        const {user_name, password} = req.body;
        const userExists = await userSchema.findOne({user_name})
        if (!userExists) return res.send({success: false, message: "bad credentials"})
        const passMatch = await bcrypt.compare(password, userExists.password)
        if (passMatch) {
            req.session.user_name = userExists.user_name
            return res.send({success: true, message: "Successfully logged in", user: {user_name: userExists.user_name, money: userExists.money, avatar: userExists.avatar}})
        }
        res.send({success: false, message: "bad credentials"})
    },
    registerUser: async (req, res) => {
        const {user_name, password} = req.body;

        console.log(req.body)

        const userExists = await userSchema.findOne({user_name})
        if (userExists) return res.send({success: false, message: "User name is already taken"})

        const user = new userSchema();
        user.user_name = user_name;
        user.password =  await bcrypt.hash(password, 10);
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

