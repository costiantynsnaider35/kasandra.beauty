import { db, auth } from "./firebaseConfig.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { sendNotificationToAdmin } from "../onesignal.js";

// Функция для получения player_id администратора по его email
export const getAdminPlayerId = async (adminEmail) => {
  const userQuery = query(
    collection(db, "users"),
    where("email", "==", adminEmail) // Ищем пользователя по email
  );

  const querySnapshot = await getDocs(userQuery);

  if (!querySnapshot.empty) {
    const adminDoc = querySnapshot.docs[0]; // Получаем первого пользователя, который соответствует запросу
    return adminDoc.data().onesignalPlayerId; // Получаем player_id администратора из базы данных
  } else {
    throw new Error("Администратор с таким email не найден.");
  }
};

export const getBookingsByDate = async (date) => {
  try {
    const allDocs = await getDocs(collection(db, "bookings"));
    const filteredDocs = allDocs.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((booking) => booking.date === date);
    return filteredDocs;
  } catch {
    toast.error("Не вдалося отримати список записів на сьогодні!");
    return [];
  }
};

export const getAllBookingDates = async () => {
  try {
    const allDocs = await getDocs(collection(db, "bookings"));
    const dates = allDocs.docs.map((doc) => doc.data().date);
    return [...new Set(dates)];
  } catch (error) {
    console.error("Помилка отримання дат записів:", error);
    return [];
  }
};

export const addBooking = async (booking) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Користувач не авторизований!");

    const admin = await isAdmin(user.uid);

    if (!admin) {
      const existingBooking = await findBookingByUidAndDate(
        user.uid,
        booking.date
      );
      if (existingBooking) {
        throw new Error(
          "У вас вже є запис на цей день. Ви можете редагувати його!"
        );
      }
    }

    const bookingsForDate = await getBookingsByDate(booking.date);
    if (bookingsForDate.length >= 5) {
      throw new Error(
        "Вибачте,будь ласка, але на сьогодні вже є максимальна кількість записів до майстра!"
      );
    }

    // Добавляем новую запись в базу данных
    const docRef = await addDoc(collection(db, "bookings"), {
      ...booking,
      uid: user.uid,
    });

    // Формируем сообщение для уведомления
    const message = `${
      booking.fullName
    } записався на процедуру ${booking.procedures.join(", ")} на ${
      booking.time
    }`;

    // Отправляем уведомление админу
    await sendNotificationToAdmin("constantin161089@gmail.com", message);

    toast.success("Ви успішно записались до майстра!");
    return { id: docRef.id, ...booking, uid: user.uid };
  } catch (error) {
    toast.error(
      error.message ||
        "Нажаль Вам не вдалось записатись до майстра, спробуйте, будь ласка, ще раз!"
    );
    throw new Error(error.message);
  }
};

const isAdmin = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() && userSnap.data().role === "admin";
};

export const updateBooking = async (id, updatedBooking) => {
  try {
    const bookingRef = doc(db, "bookings", id);
    const bookingSnap = await getDoc(bookingRef);
    if (!bookingSnap.exists()) throw new Error("Запис не знайдений!");

    const oldBooking = bookingSnap.data();

    await updateDoc(bookingRef, updatedBooking);

    // Формируем сообщение для уведомления
    let message = `${updatedBooking.fullName} змінив свою запис.`;

    // Если поменялась процедура
    if (
      updatedBooking.procedures &&
      updatedBooking.procedures !== oldBooking.procedures
    ) {
      message += ` Замінив процедуру з ${oldBooking.procedures.join(
        ", "
      )} на ${updatedBooking.procedures.join(", ")}.`;
    }

    // Если поменялось время
    if (updatedBooking.time && oldBooking.time !== updatedBooking.time) {
      message += ` Змінив час з ${oldBooking.time} на ${updatedBooking.time}.`;
    }

    // Отправляем уведомление админу
    await sendNotificationToAdmin("constantin161089@gmail.com", message);

    toast.success("Запис успішно оновлено!");
  } catch (error) {
    toast.error("Помилка при оновленні запису");
    throw new Error(error.message);
  }
};

const canUserModifyBooking = async (bookingId) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Користувач не авторизований!");

  const bookingRef = doc(db, "bookings", String(bookingId));
  const bookingSnap = await getDoc(bookingRef);

  if (!bookingSnap.exists()) throw new Error("Запис не знайдений!");

  const bookingData = bookingSnap.data();

  const admin = await isAdmin(user.uid);

  return admin || String(bookingData.uid) === String(user.uid);
};

export const deleteBooking = async (id) => {
  try {
    if (!id) {
      throw new Error("ID записи не указан");
    }

    const bookingIdStr = String(id);
    const canModify = await canUserModifyBooking(bookingIdStr);
    if (!canModify) {
      throw new Error("Недостатньо прав для видалення!");
    }

    const bookingRef = doc(db, "bookings", bookingIdStr);
    await deleteDoc(bookingRef);

    return true;
  } catch (error) {
    console.error("Delete booking error:", error);
    throw error;
  }
};

export const findBookingByUidAndDate = async (uid, date) => {
  try {
    const q = query(
      collection(db, "bookings"),
      where("uid", "==", uid),
      where("date", "==", date)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].id;
  } catch {
    toast.error("Помилка пошуку запису до майстра!");
    return null;
  }
};
