import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import CryptoJS from "crypto-js";

// Функция расшифровки
const decrypt = (ciphertext, passphrase) => {
  if (!ciphertext) {
    console.error("Ошибка: Пустой или неопределённый зашифрованный текст");
    return null;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext.trim(), passphrase);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      throw new Error("Ошибка: Расшифровка вернула пустой результат");
    }

    return decryptedText;
  } catch (error) {
    console.error("Ошибка расшифровки:", error.message);
    return null;
  }
};

const passphrase = import.meta.env.VITE_ENCRYPTION_PASSPHRASE;

// Логирование всех значений переменных окружения
console.log("Environment Variables:");
console.log("VITE_FIREBASE_API_KEY:", import.meta.env.VITE_FIREBASE_API_KEY);
console.log(
  "VITE_FIREBASE_AUTH_DOMAIN:",
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
);
console.log(
  "VITE_FIREBASE_PROJECT_ID:",
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);
console.log(
  "VITE_FIREBASE_STORAGE_BUCKET:",
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
);
console.log(
  "VITE_FIREBASE_MESSAGING_SENDER_ID:",
  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
);
console.log("VITE_FIREBASE_APP_ID:", import.meta.env.VITE_FIREBASE_APP_ID);
console.log("VITE_ADMIN_EMAIL:", import.meta.env.VITE_ADMIN_EMAIL);
console.log("VITE_ENCRYPTION_PASSPHRASE:", passphrase);

// Расшифровка конфигурации Firebase
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

// Логирование для проверки расшифровки
console.log("Firebase Config:", firebaseConfig);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
