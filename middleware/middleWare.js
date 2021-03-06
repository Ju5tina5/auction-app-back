module.exports = {
    validateUser: (req, res, next) => {
        const {user_name, password, passwordTwo} = req.body
        if (user_name.length > 15 || user_name.length < 5) return res.send({
            success: false,
            message: 'User name length is not correct'
        })
        if (password.length < 5) return res.send({success: false, message: "Bad credentials"})
        if (passwordTwo && passwordTwo.length >= 0) {
            if (password !== passwordTwo) return res.send({success: false, message: "Passwords don't match"})
            if (password.length < 5) return res.send({success: false, message: "password too short"})
        }
        next();
    },
    validateUserSession: (req, res, next) => {
        const {user_name} = req.session;
        if (!user_name) return res.send({success: false, message: 'Not logged in'})
        next();
    },

}


