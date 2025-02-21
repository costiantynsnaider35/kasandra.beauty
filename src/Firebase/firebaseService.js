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
  if (!ciphertext) {
    console.error("Ciphertext is undefined or null");
    return null;
  }

  const passphrase = import.meta.env.VITE_ENCRYPTION_PASSPHRASE;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Error decrypting data:", error);
    return null;
  }
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
  const decryptedAdminEmail = decrypt(encryptedAdminEmail);
  const isAdminEmail = email === decryptedAdminEmail;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email,
    role: isAdminEmail ? "admin" : "user",
  });

  return isAdminEmail ? "/admin" : "/bookings";
};

export const getUserRole = async (userId) => {
  if (!userId) {
    console.error("User ID is undefined or null");
    return "user";
  }

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
  if (!email || !password) {
    console.error("Email or password is undefined or null");
    throw new Error("Invalid email or password");
  }

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
