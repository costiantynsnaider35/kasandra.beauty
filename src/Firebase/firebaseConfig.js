import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import CryptoJS from "crypto-js";

const decrypt = (ciphertext, passphrase) => {
  if (!ciphertext) {
    return null;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext.trim(), passphrase);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      throw new Error("Ошибка: Расшифровка вернула пустой результат");
    }

    return decryptedText;
  } catch {
    return null;
  }
};

const passphrase = import.meta.env.VITE_ENCRYPTION_PASSPHRASE;

const firebaseConfig = {
  apiKey: decrypt(import.meta.env.VITE_FIREBASE_API_KEY, passphrase),
  authDomain: decrypt(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, passphrase),
  projectId: decrypt(import.meta.env.VITE_FIREBASE_PROJECT_ID, passphrase),
  storageBucket: decrypt(
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    passphrase
  ),
  messagingSenderId: decrypt(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    passphrase
  ),
  appId: decrypt(import.meta.env.VITE_FIREBASE_APP_ID, passphrase),
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
