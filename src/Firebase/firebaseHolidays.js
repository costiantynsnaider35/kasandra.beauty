import { db } from "./firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

export const getHolidays = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "holidays"));
    return querySnapshot.docs.map((doc) => doc.id);
  } catch (error) {
    console.error("Ошибка при получении выходных дней:", error);
    return [];
  }
};

export const addHoliday = async (date) => {
  try {
    const holidayRef = doc(db, "holidays", date);
    await setDoc(holidayRef, { date });
  } catch (error) {
    console.error("Ошибка при добавлении выходного дня:", error);
  }
};

export const deleteHoliday = async (date) => {
  try {
    const holidayRef = doc(db, "holidays", date);
    await deleteDoc(holidayRef);
  } catch (error) {
    console.error("Ошибка при удалении выходного дня:", error);
  }
};
