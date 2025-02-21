import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import CryptoJS from "crypto-js";

const decrypt = (ciphertext) => {
  const passphrase = "constantin161089";
  const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const firebaseConfig = {
  apiKey: decrypt(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: decrypt(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: decrypt(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: decrypt(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: decrypt(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: decrypt(import.meta.env.VITE_FIREBASE_APP_ID),
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
