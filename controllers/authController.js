var express = require('express');
require('dotenv').config();
const jwt = require("jsonwebtoken");
var User = require('../models/user');
var Check = require('../models/check');
const path = require('path');


module.exports.Login = async function (req, res) {
    return User.FindUser(req).then(result => {
        if (result != false) {
            const { id, email } = result;
            const userJson = {
                email: email,
                id: id
            };
            const token = jwt.sign({ user: userJson }, process.env.JWT_secretKey, { expiresIn: "1h" });
            req.session.token = token;
            res.redirect('/monitoring/home');
        }
        res.send("wrong email or password")
    }).catch(error => console.log());
}


module.exports.Register = async function (req, res) {
    return User.Register(req).then(result => {
            res.send(result)
    }).catch(error => console.log(''));
}


module.exports.Home = async function (req, res) {
    jwt.verify(req.session.token, process.env.JWT_secretKey, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            return Check.GetAll(req,authData.user).then(result => {
                res.render(path.join(__dirname, '..', 'views', 'Home.ejs'),{result: result, userId: authData.user.id});
            }).catch(error => console.log());
        }
    });
}

module.exports.Logout = async function (req, res) {
    req.session.destroy()
    res.redirect('/monitoring/signIn');
}