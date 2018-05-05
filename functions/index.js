const functions = require('firebase-functions');


const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


exports.addMessage = functions.https.onRequest((req, res) => {
    const original = req.query.text;
    return admin.database().ref('/messages').push({ original: original }).then(snapshot => {
        return res.redirect(303, snapshot.ref);
    });
});


exports.sendNotification = functions.https.onRequest((req, res) => {
    const to = req.query.to;
    const title = req.query.title;
    const body = req.query.body;

    var payload;
    if (body !== undefined && body !== '') {
        payload = {
            notification: {
                title: title,
                body: body
            }
        };
    } else {
        payload = {
            notification: {
                title: title
            }
        };
    }

    var options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };

    if (to === 'all') {
        admin.messaging().sendToTopic(to, payload, options)
            .then((response) => {
                return res.send(200, 'ok');
            })
            .catch((error) => {
                return res.send(200, 'failed');
            });
    } else {
        admin.messaging().sendToDevice(to, payload, options)
            .then((response) => {
                return res.send(200, 'ok');
                
            })
            .catch((error) => {
                return res.send(200, 'failed');
            });
    }
});