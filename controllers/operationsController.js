require('dotenv').config();
const axios = require('axios')
const jwt = require("jsonwebtoken");
var Check = require('../models/check');
const reports = require('../models/Report');
const path = require('path');


module.exports.PerformOps = async function (req, res) {
    jwt.verify(req.session.token, process.env.JWT_secretKey, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            switch (req.body.operation) {
                case "create":
                    res.sendFile(path.join(__dirname, '..', 'views', 'CreateCheckForm.html'));
                    break;
                case "edit":
                    jwt.verify(req.session.token, process.env.JWT_secretKey, (err, authData) => {
                        if (err) {
                            res.sendStatus(403);
                        } else {
                            return Check.GetOne(req).then(result => {
                                if (result != false) {
                                    res.render(path.join(__dirname, '..', 'views', 'EditCheckForm.ejs'), { result: result, docId: req.body.check });
                                }
                                res.send("error during load check info")
                            }).catch(error => console.log());
                        }
                    });
                    break;
                case "pause":
                    jwt.verify(req.session.token, process.env.JWT_secretKey, (err, authData) => {
                        if (err) {
                            res.sendStatus(403);
                        } else {
                            return Check.Pause(req).then(result => {
                                if (result) {
                                    res.redirect('/monitoring/home');
                                }
                            }).catch(error => console.log());
                        }
                    });
                    axios.post('http://localhost:8080/monitor/reload').then(response => {
                    });
                    break;
                case "delete":
                    jwt.verify(req.session.token, process.env.JWT_secretKey, (err, authData) => {
                        if (err) {
                            res.sendStatus(403);
                        } else {
                            return Check.Delete(req).then(result => {
                                if (result) {
                                    res.redirect('/monitoring/home');
                                }
                            }).catch(error => console.log());
                        }
                    });
                    axios.post('http://localhost:8080/monitor/reload').then(response => {
                    });
                    break;
                default:
                // code block
            }
        }
    });

}


module.exports.CreateCheck = async function (req, res) {
    jwt.verify(req.session.token, process.env.JWT_secretKey, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            return Check.Create(req, authData.user).then(result => {
                if (result != false) {
                    axios.post('http://localhost:8080/monitor/reload').then(response => {
                    });
                    res.redirect('/monitoring/home');
                }
                res.send("error during saving check info")
            }).catch(error => console.log());
        }
    });
}


module.exports.EditCheck = async function (req, res) {
    jwt.verify(req.session.token, process.env.JWT_secretKey, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            return Check.Edit(req).then(result => {
                if (result != false) {
                    axios.post('http://localhost:8080/monitor/reload').then(response => {
                    });
                    res.redirect('/monitoring/home');
                }
                res.send("error during editing check info")
            }).catch(error => console.log());
        }
    });
}


module.exports.GetReports = async function (req, res) {
    jwt.verify(req.session.token, process.env.JWT_secretKey, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            return reports.GetAllReports(authData.user.id).then(result => {
                if (result != false) {
                    res.render(path.join(__dirname, '..', 'views', 'Reports.ejs'), { Reports: result });
                }
                res.send("there is no reports")
            }).catch(error => console.log());
        }
    });
}
