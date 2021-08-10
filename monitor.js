var urlmon = require('url-monitor');
const reports = require('./models/Report');
const User = require('./models/user');
const axios = require("axios")
var FormData = require('form-data');


class UrlMonitor {
    constructor(userid, id, url, protocol, interval, timeout) {
        this.userid = userid;
        this.id = id;
        this.shortUrl = url
        this.url = protocol + '://' + url + '/?gws_rd=ssl';
        this.interval = interval * 60 * 1000;
        this.timeout = timeout * 1000;
        this.startTime = 0;
    }
    Run() {

        var website = new urlmon({
            url: this.url,
            interval: this.interval,
            timeout: this.timeout,
        });

        website.on('error', (data) => {
            var resTime = Math.abs(Date.now() - this.startTime);
            this.startTime = Date.now() + this.interval;

            reports.UpdateReport(this.id, 'down', this.interval, resTime).then(result => {
            }).catch(error => console.log());

            var message = { userid: this.userid, url: this.shortUrl, status: "down" }
            //SendAlertMail(this.userid,message) //limited number of emails can be send
            SendUserNotification(message)

            website.stop();
        })

        website.on('available', (data) => {
            var resTime = Math.abs(Date.now() - this.startTime);
            this.startTime = Date.now() + this.interval;

            reports.UpdateReport(this.id, 'up', this.interval, resTime).then(result => {
            }).catch(error => console.log());

            var message = { userid: this.userid, url: this.shortUrl, status: "up" }
            //SendAlertMail(this.userid,message)
            this.SendUserNotification(message)
            
            console.log(data)
        })

        this.startTime = Date.now();
        website.start();
    }

    SendAlertMail(userid, message) {
        //Send alert mail to user
        delete message.userid
        User.FindUserById(userid).then(email => {
            if (email != false) {
                const data = {
                    from: "Mailgun Sandbox <postmaster@sandbox85d9baf34d384e14a5c0b5310f39131b.mailgun.org>",
                    to: email,
                    subject: "Account Verification Link",
                    html:
                        `<p>${message}</p>`
                };
                mg.messages().send(data, function (error, body) {
                    if (error) {
                        console.log(error);
                        return "Email Sent";
                    }
                    console.log(body);
                });
            }
        }).catch(error => console.log());
    }
    
    SendUserNotification(message) {
        // Send a POST request
        axios.post('http://localhost:8080/webhook/reports', message, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(response => {
        });
    }
}


module.exports.RunCheck = function (userid, id, url, protocol, interval, timeout) {
    var u = new UrlMonitor(userid, id, url, protocol, interval, timeout);
    u.Run()
    return u;
}

