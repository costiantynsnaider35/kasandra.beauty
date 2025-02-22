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
    return null;
  }
  const passphrase = "constantin161089";
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

const encryptedAdminEmail = import.meta.env.VITE_ADMIN_EMAIL;

export const checkAuthState = (callback) => onAuthStateChanged(auth, callback);

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
    return "user";
  }
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data().role : "user";
  } catch {
    return "user";
  }
};

export const loginUser = async (email, password) => {
  if (!email || !password) {
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

export const logoutUser = async () => await signOut(auth);
