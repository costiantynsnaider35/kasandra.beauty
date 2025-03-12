import { db } from "./firebaseConfig.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import toast from "react-hot-toast";

// 🔥 Получение списка перерывов
export const getBreaks = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "breaks"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch {
    return [];
  }
};

// 🔥 Добавление перерыва (только для админов)
export const addBreak = async (breakTime) => {
  try {
    const docRef = await addDoc(collection(db, "breaks"), breakTime);
    toast.success;
    return { id: docRef.id, ...breakTime };
  } catch (error) {
    toast.Error;
    throw new Error(error.message);
  }
};

// 🔥 Удаление перерыва (только для админов)
export const deleteBreak = async (breakId) => {
  try {
    // Добавьте лог для отладки
    const breakRef = doc(db, "breaks", breakId);
    await deleteDoc(breakRef);
    toast.success;
  } catch (error) {
    // Добавьте лог для отладки
    toast.error;
    throw new Error(error.message);
  }
};
