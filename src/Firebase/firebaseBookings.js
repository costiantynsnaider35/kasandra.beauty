import { db, auth } from "./firebaseConfig.js"; // Убедись, что auth импортирован
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDoc, // Используем для проверки пользователя
} from "firebase/firestore";

/**
 * Получает записи по заданной дате
 * @param {string} date - Дата в формате "YYYY-MM-DD"
 * @returns {Promise<Array>} - Массив записей
 */
export const getBookingsByDate = async (date) => {
  try {
    const q = query(collection(db, "bookings"), where("date", "==", date));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Ошибка при получении записей:", error);
    throw error;
  }
};

/**
 * Добавляет новую запись
 * @param {Object} booking - Данные новой записи
 * @returns {Promise<Object>} - Добавленная запись с id
 */
export const addBooking = async (booking) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Ошибка: пользователь не авторизован");
  }

  try {
    const docRef = await addDoc(collection(db, "bookings"), {
      ...booking,
      uid: user.uid, // ✅ Сохраняем uid, а не userId
    });
    return { id: docRef.id, ...booking, uid: user.uid };
  } catch (error) {
    console.error("Ошибка при добавлении записи:", error);
    throw error;
  }
};

/**
 * Проверяет, является ли пользователь администратором
 * @param {string} uid - ID пользователя
 * @returns {Promise<boolean>} - true, если admin, иначе false
 */
const isAdmin = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() && userSnap.data().role === "admin";
  } catch (error) {
    console.error("Ошибка при проверке прав администратора:", error);
    return false;
  }
};

/**
 * Обновляет существующую запись
 * @param {string} id - ID записи
 * @param {Object} updatedBooking - Обновленные данные
 * @returns {Promise<void>}
 */
export const updateBooking = async (id, updatedBooking) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Ошибка: пользователь не авторизован");
  }

  try {
    const bookingRef = doc(db, "bookings", id);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error("Ошибка: запись не найдена");
    }

    const bookingData = bookingSnap.data();
    const admin = await isAdmin(user.uid);

    if (!admin && bookingData.uid !== user.uid) {
      throw new Error("Ошибка: недостаточно прав для обновления");
    }

    await updateDoc(bookingRef, updatedBooking);
  } catch (error) {
    console.error("Ошибка при обновлении записи:", error);
    throw error;
  }
};

/**
 * Удаляет запись по ID
 * @param {string} id - ID записи
 * @returns {Promise<void>}
 */
export const deleteBooking = async (id) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Ошибка: пользователь не авторизован");
  }

  try {
    const bookingRef = doc(db, "bookings", id);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error("Ошибка: запись не найдена");
    }

    const bookingData = bookingSnap.data();
    const admin = await isAdmin(user.uid);

    if (!admin && bookingData.uid !== user.uid) {
      throw new Error("Ошибка: недостаточно прав для удаления");
    }

    await deleteDoc(bookingRef);
  } catch (error) {
    console.error("Ошибка при удалении записи:", error);
    throw error;
  }
};
export const findBookingByUid = async (uid) => {
  const q = query(collection(db, "bookings"), where("uid", "==", uid));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("Ошибка: запись не найдена");
  }

  return querySnapshot.docs[0].id; // Возвращает ID документа Firestore
};
