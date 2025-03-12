import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig.js";
import { checkAdminPermissions } from "./firebaseHolidays.js";

// 🔥 Получение списка перерывов
export const getBreaks = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "breaks"));
    return querySnapshot.docs.map((doc) => doc.data());
  } catch {
    return [];
  }
};

// 🔥 Добавление перерыва (только для админов)
export const addBreak = async (breakTime) => {
  try {
    await checkAdminPermissions();
    const breakRef = doc(collection(db, "breaks"));
    await setDoc(breakRef, breakTime);
  } catch (error) {
    console.error("Ошибка при добавлении перерыва:", error);
    throw error; // Для обработки в UI
  }
};

// 🔥 Удаление перерыва (только для админов)
export const deleteBreak = async (breakId) => {
  try {
    await checkAdminPermissions();
    const breakRef = doc(db, "breaks", breakId);
    await deleteDoc(breakRef);
  } catch (error) {
    console.error("Ошибка при удалении перерыва:", error);
    throw error;
  }
};
