const admin = require('firebase-admin');
const { report } = require('../routes');
var db = admin.firestore();


module.exports.Create = async function (data) {///
    checkReport = {
        url: data.url,
        userid: data.userid,
        id: data.id,
        status: "",
        availability: '',
        outages: 0,
        upNumber: 0,
        downtime: 0,
        uptime: 0,
        responseTime: 0,
        history: ''
    };
    const ReportsRef = db.collection('CheckReport');
    const response = await ReportsRef.doc().set(checkReport);
    if (response.empty) {
        return false;
    }
    return "report created";
}

module.exports.GetAllReports = async function (userid) {
    const ReportsRef = db.collection('CheckReport');
    const snapshot = await ReportsRef.where('userid', '==', userid).get();
    if (snapshot.empty) {
        return false;
    }
    return snapshot;
}

module.exports.UpdateReport = async function (id, flag, interval, resTime) {///
    this.GetOne(id).then(report => {
        console.log(resTime)
        if (flag == "down") {
            newReport = {
                status: 'down',
                outages: report.outages + 1,
                downtime: report.downtime + (interval / 1000),
            };

            total = report.upNumber + newReport.outages;
            newReport.availability = report.upNumber / total;
            newReport.availability *= 100;
            if (report.outages == 0 && report.upNumber == 0) {
                newReport.responseTime = resTime
            } else {
                newReport.responseTime = ((report.responseTime * (total - 1)) + (resTime/1000)) / total
            }
            this.Edit(id, newReport);
        } else {
            newReport = {
                status: 'up',
                upNumber: report.upNumber + 1,
                uptime: report.uptime + (interval / 1000),
            };

            total = newReport.upNumber + report.outages;
            newReport.availability = newReport.upNumber / total;
            newReport.availability *= 100;
            if (report.outages == 0 && report.upNumber == 0) {
                newReport.responseTime = resTime
            } else {
                newReport.responseTime = ((report.responseTime * (total - 1)) + (resTime/1000)) / total
            }
            this.Edit(id, newReport);
        }
    }).catch(error => console.log());

}

module.exports.GetOne = async function (id) {///
    const ReportsRef = db.collection('CheckReport');
    const snapshot = await ReportsRef.where('id', '==', id).get();
    if (snapshot.empty) {
        return false;
    }
    return snapshot.docs[0].data();
}

module.exports.Edit = async function (id, data) {///
    const ReportsRef = db.collection('CheckReport');
    const snapshot = await ReportsRef.where('id', '==', id).get();
    docid = snapshot.docs[0].id;

    const ReportsRef1 = db.collection('CheckReport');
    const snapshot1 = await ReportsRef1.doc(docid).update(data);
    if (snapshot1.empty) {
        return false;
    }
    return snapshot;
}

module.exports.Delete = async function (id) {///
    const ReportsRef = db.collection('CheckReport');
    const response1 = await ReportsRef.where('id', '==', id).get().then(function (snapshot1) {
        snapshot1.forEach(function (doc) {
            doc.ref.delete();
        });
    });
    return true;
}