const UserModel = require('../models/user.model')
const jwt = require('jsonwebtoken');
const { signUpErrors, signInErrors } = require('../utils/error.utils');

const maxAge = 3 * 24 * 60 * 60 * 1000 ;

const createToken = (id) => {
    return jwt.sign({id}, process.env.TOKEN_SECRET)
}

module.exports.signUp = async (req, res) => {
    const {firstname, lastname, nationality, profil, email, password, profession, phoneNumber, expoToken} = req.body
    console.log(req.body)
    try {
        const user = await UserModel.create({firstname, lastname, nationality, profil, email, password, profession, phoneNumber, expoToken});
        res.status(201).json({user: user._id});
    }
    catch (err) {
        const errors = signUpErrors(err);
        res.status(200).send({errors});
    }
}

module.exports.signIn = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await UserModel.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true});
        res.status(200).json({user: user._id, token})
    } catch (err) {
        const errors = signInErrors(err);
        res.status(200).json({errors})
    }
}


module.exports.logout = async (req, res) => {
    res.cookie('jwt', '' );
    res.redirect('/');
}