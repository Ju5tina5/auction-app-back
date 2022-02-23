
module.exports = {
    validateUser: (req, res, next) => {
        const {user_name, password, passwordTwo} = req.body

        if(password !== passwordTwo) return res.send({success: false, message: "bad password"})
        if(password.length < 5) return res.send({success: false, message: "password too short"})

        next();
    }
}


