import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCCF8V8hng4WtlWbcbJvsXggwFd3H_uZl0",
  authDomain: "shnoor-job-portal.firebaseapp.com",
  projectId: "shnoor-job-portal",
  storageBucket: "shnoor-job-portal.firebasestorage.app",
  messagingSenderId: "1032602775142",
  appId: "1:1032602775142:web:08e522cdb51e492a3207a7",
  measurementId: "G-RXWW47YJH4",
};

const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

export { messaging, getToken, onMessage };