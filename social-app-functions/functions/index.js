const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const express = require("express");
const app = express();

// Create Scream function
exports.createScream = functions.https.onRequest((req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Method not allowed" });
  }
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
  };

  admin
    .firestore()
    .collection("screams")
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
});

// get screams function, where the first parameter is route, the second is a handler
app.get("/screams", (req, res) => {
  admin
    .firestore()
		.collection("screams")
		// make the latest scream first
		.orderBy('createdAt', 'desc') 
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
				// instead of pushing only data, we can request an object
        screams.push({
					screamId: doc.id,
					body: doc.data().body,
					userHandle: doc.data().userHandle,
					createdAt: doc.data().createdAt
				});
      });
      return res.json(screams);
    })
    .catch(err => console.error(err));
});

// we need to tell Firebase that this app is a container for all our routes
exports.api = functions.https.onRequest(app);