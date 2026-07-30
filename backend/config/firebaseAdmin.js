const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

const serviceAccount = require("./shnoor-job-portal-firebase-adminsdk-fbsvc-39225a8005.json");

const app = initializeApp({
  credential: cert(serviceAccount),
});

module.exports = {
  app,
  messaging: getMessaging(app),
};