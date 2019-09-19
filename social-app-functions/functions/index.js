const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const config = {
  apiKey: "AIzaSyAVOWCtfh6GWJFFefpsqrzA0Sf4GbowBzg",
  authDomain: "unikvozm-social-app.firebaseapp.com",
  databaseURL: "https://unikvozm-social-app.firebaseio.com",
  projectId: "unikvozm-social-app",
  storageBucket: "unikvozm-social-app.appspot.com",
  messagingSenderId: "79821215460",
  appId: "1:79821215460:web:d8791bc3853338ae517ef1"
};

const app = require("express")();
const firebase = require("firebase");
firebase.initializeApp(config);

// Create Scream function
app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString() // to make a data readable
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
    .orderBy("createdAt", "desc")
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

// Signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  // TODO: validate data

  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
      return res
        .status(201)
        .json({ message: `user ${data.user.uid} signed up successfully` });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});

// we need to tell Firebase that this app is a container for all our routes
exports.api = functions.region("europe-west1").https.onRequest(app);
