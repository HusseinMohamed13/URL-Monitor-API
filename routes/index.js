var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var session = require('express-session');
var authController = require('../controllers/authController');
var opsController = require('../controllers/operationsController');
var User = require('../models/user');
const path = require('path');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(session({ secret: process.env.Session_secretKey , saveUninitialized: true, resave: false }));

router.get('/monitoring/signUp', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'views', 'SignupForm.html'));
})
router.get('/monitoring/signIn', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'views', 'SigninForm.html'));
})

router.get('/monitoring/home', authController.Home)
router.post('/user/signIn', authController.Login)
router.post('/user/signUp', authController.Register)
router.post('/user/logout', authController.Logout)
router.get('/auth/account/:token', User.CreateUser)

router.post('/monitoring/operations', opsController.PerformOps)
router.post('/monitoring/create', opsController.CreateCheck)
router.post('/monitoring/edit', opsController.EditCheck)
router.get('/monitoring/reports', opsController.GetReports)

module.exports = router;