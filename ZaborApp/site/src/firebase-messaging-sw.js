importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyCUdOC2P-E7ENvh7B8DKZsd_tvr-2-n3QY",
  authDomain: "zabor-1574162000348.firebaseapp.com",
  // databaseURL: "https://zabor-1574162000348.firebaseio.com",
  projectId: "zabor-1574162000348",
  storageBucket: "zabor-1574162000348.appspot.com",
  messagingSenderId: "402043469771",
  appId: "1:402043469771:web:95802fa2030fc3053a404e",
  // measurementId: "G-7G3WBHW1WC"
};

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
// const firebaseApp = initializeApp(firebaseConfig);
const app = firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
// const messaging = getMessaging(firebaseApp);
const messaging = firebase.messaging();
