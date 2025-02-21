import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig.js";
import CryptoJS from "crypto-js";

const decrypt = (ciphertext) => {
  const passphrase = "constantin161089";
  const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const encryptedAdminEmail = import.meta.env.VITE_ADMIN_EMAIL;

export const checkAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const registerUser = async (email, password) => {
  const signInMethods = await fetchSignInMethodsForEmail(auth, email);
  if (signInMethods.length > 0) {
    throw new Error("Ця електронна пошта вже використовується!");
  }

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
  const isAdminEmail = email === decrypt(encryptedAdminEmail);

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email,
    role: isAdminEmail ? "admin" : "user",
  });

  return isAdminEmail ? "/admin" : "/bookings";
};

export const getUserRole = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    return userDoc.exists() ? userDoc.data().role : "user";
  } catch (error) {
    console.error("Помилка отримання ролі:", error);
    return "user";
  }
};

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  const role = await getUserRole(user.uid);
  return role === "admin" ? "/admin" : "/bookings";
};

export const logoutUser = async () => {
  await signOut(auth);
};
