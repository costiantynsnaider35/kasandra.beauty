import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBmk8uExUubmKd7RL5SLfjJkO1DRdJKqXE",
  authDomain: "kasandrabeauty-f43f6.firebaseapp.com",
  projectId: "kasandrabeauty-f43f6",
  storageBucket: "kasandrabeauty-f43f6.appspot.com",
  messagingSenderId: "11834980597",
  appId: "1:11834980597:web:ba75bf0aa19e5a2eecedbc",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
