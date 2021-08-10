const express = require('express');
var app = express();
app.set('view engine', 'ejs');
var routes = require('./routes/index');
var checks = require('./models/check');
var monitor = require('./monitor');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var server = require("http").createServer(app);
var io = require("socket.io")(server);
const port = process.env.PORT || 8080;

app.use('/', routes);

app.post('/webhook/reports', function (req, res) {
    for (var field in req.body) {
        io.emit('thread', JSON.parse(field))
    }
})

app.post('/monitor/reload', function (req, res) {
    RunChecks()
})


//app.listen(port);
console.log('Server started at http://localhost:' + port);


io.on("connection", function (socket) {
    socket.on('disconnect', function () {
    });
});


console.log('Socket Server started at http://localhost:' + port);
server.listen(port);


function RunChecks() {
    return checks.GetAllChecks().then(snapshot => {
        if (snapshot != false) {
            snapshot.forEach(doc => {
                id = doc.id
                userid = doc.data().id;
                url = doc.data().url
                protocol = doc.data().protocol
                interval = doc.data().interval
                timeout = doc.data().timeout
                if (doc.data().flag == "on") {
                    monitor.RunCheck(userid, id, url, protocol, interval, timeout)
                }
            });
        }
    }).catch(error => console.log());
}

//RunChecks()