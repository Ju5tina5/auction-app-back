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
    updateUserAvatar: async (req, res) => {
        const {avatar} = req.body;
        if(!avatar.includes('http')) res.send({success: false, message: 'Link not provided'});
        const {user_name} = req.session;
        const updatedUser = await userSchema.findOneAndUpdate({user_name}, {$set: {avatar: avatar}}, {new: true});
        res.send({success: true, user: {user_name: updatedUser.user_name, avatar: updatedUser.avatar, money: updatedUser.money}});
    },
    decreaseUserMoney: async (req, res, next) => {
        const {amount} = req.body;
        const {user_name} = req.session;
        let oldMoney = await userSchema.findOne({user_name}, {money: 1})
        let money = oldMoney.money - Number(amount);
        if(money < 0){
            return res.send({success: false, message: 'Not enough money'})
        }
        await userSchema.findOneAndUpdate({user_name}, {$set: {money: money}})
        next();
    },
}

