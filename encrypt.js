import CryptoJS from "crypto-js";

const encrypt = (text) => {
  const passphrase = "constantin161089";
  return CryptoJS.AES.encrypt(text, passphrase).toString();
};

const credentials = {
  apiKey: encrypt("AIzaSyBmk8uExUubmKd7RL5SLfjJkO1DRdJKqXE"),
  authDomain: encrypt("kasandrabeauty-f43f6.firebaseapp.com"),
  projectId: encrypt("kasandrabeauty-f43f6"),
  storageBucket: encrypt("kasandrabeauty-f43f6.appspot.com"),
  messagingSenderId: encrypt("11834980597"),
  appId: encrypt("1:11834980597:web:ba75bf0aa19e5a2eecedbc"),
  adminEmail: encrypt("constantin161089@gmail.com"),
};
