import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { doc, getFirestore, getDoc } from "firebase/firestore"; // Используем полный импорт из firestore
import CryptoJS from "crypto-js";

// Функция для расшифровки
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

const botToken = "7624646517:AAGMp1mk9gAkjKLiLJiUPU3w67l9E0i-w7g"; // Ваш токен бота Telegram
const chatId = "887849419"; // ID чата администратора

// Функция для проверки, является ли пользователь администратором
const isAdmin = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() && userSnap.data().role === "admin";
};

// Функция для отправки сообщений в Telegram
const sendTelegramMessage = async (message) => {
  const user = auth.currentUser;

  // Проверяем, является ли текущий пользователь администратором
  const admin = user ? await isAdmin(user.uid) : false;
  if (admin) {
    // Если администратор, не отправляем уведомление
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const params = {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Error sending message");
  }
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, sendTelegramMessage, isAdmin };
