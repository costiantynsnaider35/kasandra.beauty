import { db, auth, sendTelegramMessage } from "./firebaseConfig.js";
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

// Форматирование даты в формате 20.03.25
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(2); // Берем последние 2 цифры года
  return `${day}.${month}.${year}`;
};

// Форматирование времени
const formatTime = (time) => {
  return time.slice(0, 5); // Получаем только время без секунд
};

// Функция для определения пола пользователя по имени
const getGender = (name) => {
  if (!name) return "unknown"; // Если name не определено, возвращаем "unknown"

  const femaleEndings = ["а", "я"]; // Окончания для женских имен
  const maleEndings = ["й", "н", "в", "р", "с"]; // Окончания для мужских имен

  const lastChar = name.slice(-1).toLowerCase();

  if (femaleEndings.includes(lastChar)) {
    return "female";
  }
  if (maleEndings.includes(lastChar)) {
    return "male";
  }

  return "unknown"; // Если не удалось определить пол
};

// Функция для формирования сообщения в зависимости от пола и действия
const getActionMessage = (name, action) => {
  const gender = getGender(name);
  switch (action) {
    case "book":
      return gender === "female"
        ? "записалась"
        : gender === "male"
        ? "записався"
        : "записався";
    case "update":
      return gender === "female"
        ? "оновила"
        : gender === "male"
        ? "оновив"
        : "оновив";
    case "delete":
      return gender === "female"
        ? "видалила"
        : gender === "male"
        ? "видалив"
        : "видалив";
    default:
      return "";
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

    // Форматируем дату и время для отображения
    const formattedDate = formatDate(new Date());
    const formattedTime = formatTime(new Date().toLocaleTimeString());

    // Отправка уведомления в Telegram
    if (!admin) {
      const message = `${booking.fullName} ${getActionMessage(
        booking.fullName,
        "book"
      )} 
на: ${booking.date}, час: ${booking.time}, ${booking.procedures
        .map((p) => `${p.category}: ${p.procedure}`)
        .join(", ")}

Дата створення запису: ${formattedDate}
Час створення запису: ${formattedTime}`;

      sendTelegramMessage(message);
    }

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
    const user = auth.currentUser;
    if (!user) throw new Error("Користувач не авторизований!");

    const admin = await isAdmin(user.uid);

    const bookingRef = doc(db, "bookings", id);
    const bookingSnap = await getDoc(bookingRef);
    if (!bookingSnap.exists()) throw new Error("Запис не знайдений!");

    const oldBooking = bookingSnap.data();

    // Форматируем дату и время для отображения
    const formattedDate = formatDate(new Date());
    const formattedTime = formatTime(new Date().toLocaleTimeString());

    // Формируем сообщение
    let message = `${updatedBooking.fullName} ${getActionMessage(
      updatedBooking.fullName,
      "update"
    )} запис`;

    if (updatedBooking.date && updatedBooking.date !== oldBooking.date) {
      message += ` з ${oldBooking.date} на ${updatedBooking.date}`;
    }

    if (updatedBooking.time && updatedBooking.time !== oldBooking.time) {
      message += `, час з ${oldBooking.time} на ${updatedBooking.time}`;
    }

    if (updatedBooking.procedures) {
      const oldProcedures = oldBooking.procedures
        .map((p) => `${p.category}: ${p.procedure}`)
        .join(", ");
      const newProcedures = updatedBooking.procedures
        .map((p) => `${p.category}: ${p.procedure}`)
        .join(", ");
      if (newProcedures !== oldProcedures) {
        message += `, Процедури: з ${oldProcedures} на ${newProcedures}`;
      }
    }

    message += `

Дата оновлення запису: ${formattedDate}
Час оновлення запису: ${formattedTime}`;

    sendTelegramMessage(message);

    // Обновляем только измененные данные
    await updateDoc(bookingRef, updatedBooking);

    // Отправка уведомления в Telegram, если пользователь не администратор
    if (!admin) {
      sendTelegramMessage(message);
    }

    toast.success("Запис успішно оновлено!");
  } catch (error) {
    console.error("Error updating booking: ", error);
    toast.error("Помилка при оновленні запису: " + (error.message || error));
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
    const user = auth.currentUser;
    if (!user) throw new Error("Користувач не авторизований!");

    const admin = await isAdmin(user.uid);

    if (!id) {
      throw new Error("ID записи не указан");
    }

    const bookingIdStr = String(id);
    const canModify = await canUserModifyBooking(bookingIdStr);
    if (!canModify) {
      throw new Error("Недостатньо прав для видалення!");
    }

    const bookingRef = doc(db, "bookings", bookingIdStr);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) throw new Error("Запис не знайдений!");

    const bookingData = bookingSnap.data();

    // Формируем сообщение для уведомления
    const formattedDate = formatDate(new Date());
    const formattedTime = formatTime(new Date().toLocaleTimeString());

    const message = `${bookingData.fullName} ${getActionMessage(
      bookingData.fullName,
      "delete"
    )} свій запис 
${bookingData.date} на ${bookingData.time}

Дата видалення запису: ${formattedDate}
Час видалення запису: ${formattedTime}`;

    // Удаляем запись
    await deleteDoc(bookingRef);

    // Отправка уведомления в Telegram, если пользователь не администратор
    if (!admin) {
      sendTelegramMessage(message, "MarkdownV2");
    }

    toast.success("Запис успішно видалено!");

    return true;
  } catch {
    toast.error("Помилка при видаленні запису");
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

export const deleteOldBookings = async () => {
  try {
    const now = new Date();
    now.setDate(now.getDate() - 30);
    const formattedDate = now.toISOString().split("T")[0];

    const bookingsRef = collection(db, "bookings");
    const allDocs = await getDocs(bookingsRef);

    const oldBookings = allDocs.docs.filter(
      (doc) => doc.data().date < formattedDate
    );

    if (oldBookings.length === 0) {
      return;
    }

    oldBookings.forEach(async (booking) => {
      await deleteDoc(doc(db, "bookings", booking.id));
    });
  } catch {
    console.error;
  }
};
