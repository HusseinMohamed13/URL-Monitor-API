const bcrypt = require('bcrypt');
const admin = require('firebase-admin');
const jwt = require("jsonwebtoken");
const path = require('path');
var serviceAccount = require(path.join(__dirname, '..', process.env.ServiceAccountPath));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
var db = admin.firestore();
const saltRounds = process.env.SaltRounds;
const mailgun = require("mailgun-js");
const { has } = require('config');
const DOMAIN = "sandbox85d9baf34d384e14a5c0b5310f39131b.mailgun.org";
const mg = mailgun({ apiKey: "14663ac27d4f49dd7840aaa31a29ba20-64574a68-c69ace6e", domain: DOMAIN });


module.exports.Register = async function (req) {
    const usersRef = db.collection('Users');
    const snapshot = await usersRef.where('email', '==', req.body.email).get();
    if (snapshot.empty) {
        bcrypt.hash(req.body.password, 10).then(function(hash) {
            userJson = {
                email: req.body.email,
                username: req.body.name,
                password: hash
            }
            const token = jwt.sign({ user: userJson }, process.env.JWT_secretKey, { expiresIn: "30m" })
            url = "http://localhost:8080/auth/account/" + token
            const data = {
                from: "Mailgun Sandbox <postmaster@sandbox85d9baf34d384e14a5c0b5310f39131b.mailgun.org>",
                to: userJson.email,
                subject: "Account Verification Link",
                html:
                    `<a href = ${url}>${url}</a>`
            };
            mg.messages().send(data, function (error, body) {
                if (error) {
                    console.log(error);
                }
            });
            return 'Verify your email to login to site!';
        })
    } else {
        return "user already exist";
    }
}


module.exports.FindUser = async function (req) {
    const data = {
        email: req.body.email,
        password: req.body.password
    };
    const usersRef = db.collection('Users');
    const snapshot = await usersRef.where('email', '==', data.email).get();
    if (!snapshot.empty) {
        const user = snapshot.docs[0].data();
        const match = await bcrypt.compare(data.password, user.password);
        if (match) {
            email = data.email;
            id = snapshot.docs[0].id;
            return { id, email };
        }
    }
    return false;
}

module.exports.CreateUser = async function (req, res) {
    jwt.verify(req.params.token, process.env.JWT_secretKey, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            return this.Create(authData).then(result => {
                if (result != false) {
                    res.redirect('/monitoring/signIn');
                }
            }).catch(error => console.log());
        }
    });

}

Create = async function (authData) {
    var data = {
        name: authData.user.username,
        email: authData.user.email,
        password: authData.user.password
    };
    const usersRef = db.collection('Users');
    const snapshot = await usersRef.where('email', '==', data.email).get();
    if (snapshot.empty) {
        const response = await db.collection('Users').doc().set(data);
        if (response.empty) {
            return false;
        }
        return "registered";
    } else {
        return "user already exist";
    }
}


module.exports.FindUserById = async function (userid) {
    const usersRef = db.collection('Users');
    const snapshot = await usersRef.doc(userid).get();
    if (!snapshot.empty) {
        const user = snapshot.data();
        return user.email;
    }
    return false;
}