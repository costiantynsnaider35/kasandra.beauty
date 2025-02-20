import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBmk8uExUubmKd7RL5SLfjJkO1DRdJKqXE",
  authDomain: "kasandrabeauty-f43f6.firebaseapp.com",
  projectId: "kasandrabeauty-f43f6",
  storageBucket: "kasandrabeauty-f43f6.firebasestorage.app",
  messagingSenderId: "11834980597",
  appId: "1:11834980597:web:ba75bf0aa19e5a2eecedbc",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const checkAuthState = (callback) => {
  onAuthStateChanged(auth, callback);
};

export { auth, db, checkAuthState };
