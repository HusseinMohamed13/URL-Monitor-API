const admin = require('firebase-admin');
var db = admin.firestore();
var reports = require('../models/report');


module.exports.Create = async function (req, userData) {
    checkData = req.body;
    checkData.id = userData.id

    data = {
        url: checkData.url,
        userid: checkData.id,
        id: '',
    };

    checkData.flag = "on"
    const checksRef = db.collection('Checks');
    const response = await checksRef.add(checkData).then((docRef) => {
        data.id = docRef.id;
    }).catch((error) => {
        return false;
    });

    const response1 = reports.Create(data);
    if (response1 == false) {
        return false;
    }
    return "check saved";
}

module.exports.GetAll = async function (req, userData) {
    const checksRef = db.collection('Checks');
    const snapshot = await checksRef.where('id', '==', userData.id).get();
    if (snapshot.empty) {
        return false;
    }
    return snapshot;
}

module.exports.GetOne = async function (req) {
    const checksRef = db.collection('Checks');
    const snapshot = await checksRef.doc(req.body.check).get();
    if (snapshot.empty) {
        return false;
    }
    return snapshot.data();
}

module.exports.Edit = async function (req) {
    const checksRef = db.collection('Checks');
    data = req.body
    docid = req.body.docId
    delete data.docId;
    const snapshot = await checksRef.doc(docid).update(data);
    if (snapshot.empty) {
        return false;
    }
    return snapshot;
}

module.exports.Delete = async function (req) {
    const checksRef = db.collection('Checks');
    docid = req.body.check
    const snapshot = await checksRef.doc(docid).delete();
    if (!snapshot.empty) {
        reports.Delete(docid);
        return true;
    }
    return false;
}

module.exports.Pause = async function (req) {
    const checksRef = db.collection('Checks');
    const snapshot = await checksRef.doc(req.body.check).get();
    if (snapshot.empty) {
        return false;
    } else {
        data = snapshot.data();
        if (data.flag == "on") {
            data.flag = "off";
        } else {
            data.flag = "on";
        }
        const result = await checksRef.doc(req.body.check).update(data);
        if (result != false) {
            return true;
        }
    }
    return false;
}

module.exports.GetAllChecks = async function (req) {
    const checksRef = db.collection('Checks');
    const snapshot = await checksRef.get();
    if (snapshot.empty) {
        return false;
    }
    return snapshot;
}