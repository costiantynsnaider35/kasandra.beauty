import { db } from "./firebaseConfig.js";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const checkAdminPermissions = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Пользователь не авторизован");

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || userSnap.data().role !== "admin") {
    throw new Error("Недостаточно прав для выполнения операции");
  }
};

export const getHolidays = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "holidays"));
    return querySnapshot.docs.map((doc) => doc.data().date);
  } catch (error) {
    console.error("Ошибка при получении выходных дней:", error);
    return [];
  }
};

export const addHoliday = async (date) => {
  try {
    await checkAdminPermissions();
    const holidayRef = doc(db, "holidays", date);
    await setDoc(holidayRef, { date });
  } catch (error) {
    console.error("Ошибка при добавлении выходного дня:", error);
    throw error;
  }
};

export const deleteHoliday = async (date) => {
  try {
    await checkAdminPermissions();
    const holidayRef = doc(db, "holidays", date);
    await deleteDoc(holidayRef);
  } catch (error) {
    console.error("Ошибка при удалении выходного дня:", error);
    throw error;
  }
};
