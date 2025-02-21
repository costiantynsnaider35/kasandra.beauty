import CryptoJS from "crypto-js";

const encrypt = (text) => {
  const passphrase = "your-secret-passphrase"; // Используй свою секретную фразу
  return CryptoJS.AES.encrypt(text, passphrase).toString();
};

const apiKey = encrypt("AIzaSyBmk8uExUubmKd7RL5SLfjJkO1DRdJKqXE");
const authDomain = encrypt("kasandrabeauty-f43f6.firebaseapp.com");
const projectId = encrypt("kasandrabeauty-f43f6");
const storageBucket = encrypt("kasandrabeauty-f43f6.appspot.com");
const messagingSenderId = encrypt("11834980597");
const appId = encrypt("1:11834980597:web:ba75bf0aa19e5a2eecedbc");
const adminEmail = encrypt("constantin161089@gmail.com");

console.log("API Key:", apiKey);
console.log("Auth Domain:", authDomain);
console.log("Project ID:", projectId);
console.log("Storage Bucket:", storageBucket);
console.log("Messaging Sender ID:", messagingSenderId);
console.log("App ID:", appId);
console.log("Admin Email:", adminEmail);
