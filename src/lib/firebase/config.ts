// Firebase configuration provided by user
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDTdITVBPtW1kIyd6nm5N6Qq9wBN-mEsAY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "certidesk-pro.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "certidesk-pro",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "certidesk-pro.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "351332087127",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:351332087127:web:09209366e11aa4415aba12",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-3ZJ0XK86XL",
};

export const isFirebaseConfigured = true;
