// "use client";
// import { initializeApp, getApps, getApp } from "firebase/app";
// import {
//   getMessaging,
//   getToken,
//   onMessage,
//   Messaging,
// } from "firebase/messaging";

// // Firebase configuration from environment variables
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };

// // ✅ Ensure Firebase is initialized only once
// const firebaseApp = !getApps().length
//   ? initializeApp(firebaseConfig)
//   : getApp();
// let messaging: Messaging | null = null;

// const initializeFirebaseMessaging = () => {
//   if (!messaging && typeof window !== "undefined" && "Notification" in window) {
//     messaging = getMessaging(firebaseApp);
//   }
// };

// export { firebaseApp }; // ✅ Export the initialized Firebase app

// export const requestForToken = async (): Promise<string | null> => {
//   initializeFirebaseMessaging();

//   if (!messaging) {
//     console.warn("⚠️ Messaging is not initialized.");
//     return null;
//   }

//   try {
//     const permission = await Notification.requestPermission();
//     if (permission !== "granted") {
//       console.warn("🚫 Notification permission denied.");
//       return null;
//     }

//     const token = await getToken(messaging, {
//       vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "",
//     });

//     if (token) {
//       console.log("✅ FCM Token:", token);
//       return token;
//     } else {
//       console.warn("⚠️ No registration token available.");
//       return null;
//     }
//   } catch (error) {
//     console.error("❌ Error getting FCM token:", error);
//     return null;
//   }
// };

// export const onForegroundMessage = async () => {
//   if (!messaging) {
//     console.warn("⚠️ Messaging is not initialized.");
//     return null;
//   }

//   return new Promise((resolve, reject) => {
//     onMessage(messaging as Messaging, (payload) => {
//       if (!payload || typeof payload !== "object") {
//         console.warn("⚠️ Invalid message payload received:", payload);
//         return reject(new Error("Invalid message payload received"));
//       }

//       console.log("🚀 Message received in foreground:", payload);
//       resolve(payload);
//     });
//   });
// };
