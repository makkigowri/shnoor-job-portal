importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCCF8V8hng4WtlWbcbJvsXggwFd3H_uZl0",
  authDomain: "shnoor-job-portal.firebaseapp.com",
  projectId: "shnoor-job-portal",
  storageBucket: "shnoor-job-portal.firebasestorage.app",
  messagingSenderId: "1032602775142",
  appId: "1:1032602775142:web:08e522cdb51e492a3207a7",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/logo.png",
    }
  );
});