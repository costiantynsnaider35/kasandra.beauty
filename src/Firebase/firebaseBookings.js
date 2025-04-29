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

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(2);
  return `${day}.${month}.${year}`;
};

const formatTime = (time) => {
  return time.slice(0, 5);
};

const getGender = (name) => {
  if (!name) return "unknown";

  const femaleEndings = ["а", "я"];
  const maleEndings = ["й", "н", "в", "р", "с"];

  const lastChar = name.slice(-1).toLowerCase();

  if (femaleEndings.includes(lastChar)) {
    return "female";
  }
  if (maleEndings.includes(lastChar)) {
    return "male";
  }

  return "unknown";
};

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

    const docRef = await addDoc(collection(db, "bookings"), {
      ...booking,
      uid: user.uid,
    });

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

    const formattedDate = formatDate(new Date());
    const formattedTime = formatTime(new Date().toLocaleTimeString());

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

    const formattedDate = formatDate(new Date());
    const formattedTime = formatTime(new Date().toLocaleTimeString());

    const message = `${bookingData.fullName} ${getActionMessage(
      bookingData.fullName,
      "delete"
    )} свій запис 
${bookingData.date} на ${bookingData.time}

Дата видалення запису: ${formattedDate}
Час видалення запису: ${formattedTime}`;

    await deleteDoc(bookingRef);

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

export const getMonthlyStats = async () => {
  try {
    const allDocs = await getDocs(collection(db, "bookings"));
    const bookings = allDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const now = new Date();

    // Функция для преобразования времени в минутное значение (для сравнения)
    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const services = [
      {
        title: "Манікюр",
        items: [
          { description: "з покриттям", price: 750 },
          { description: "френч", price: 100 },
          { description: "без покриття", price: 350 },
          { description: "корекція нарощених нігтів", price: 800 },
          { description: "нарощування", price: 1000 },
          { description: "арт френч", price: 2500 },
          { description: "чоловічий", price: 450 },
        ],
      },
      {
        title: "Педикюр",
        items: [
          { description: "чищення", price: 500 },
          { description: "подологічний", price: 600 },
          { description: "з покриттям", price: 800 },
          { description: "чоловічий", price: 600 },
        ],
      },
      {
        title: "Брови",
        items: [
          { description: "корекція воском", price: 250 },
          { description: "корекція з фарбуванням", price: 400 },
        ],
      },
    ];

    const getProcedurePrice = (category, procedure) => {
      const serviceCategory = services.find(
        (service) => service.title === category
      );
      if (serviceCategory) {
        const item = serviceCategory.items.find(
          (item) => item.description === procedure
        );
        if (item) {
          return item.price;
        } else {
          console.log(
            `Процедура не найдена: ${procedure} в категорії ${category}`
          );
        }
      } else {
        console.log(`Категорія не знайдена: ${category}`);
      }
      return 0; // Если процедура не найдена, возвращаем 0
    };

    const pastBookings = bookings.filter((booking) => {
      if (!booking.date || !booking.time) return false;

      const [year, month, day] = booking.date.split("-").map(Number);
      const bookingDate = new Date(year, month - 1, day);

      const bookingTimeInMinutes = parseTime(booking.time);
      const nowTimeInMinutes = now.getHours() * 60 + now.getMinutes();

      // Сравниваем дату и время (должно быть прошедшим)
      return (
        bookingDate < now ||
        (bookingDate.getTime() === now.getTime() &&
          bookingTimeInMinutes < nowTimeInMinutes)
      );
    });

    // Создаем статистику по месяцам
    const monthlyStats = pastBookings.reduce((stats, booking) => {
      const [year, month] = booking.date.split("-").map(Number);
      const key = `${year}-${month}`;

      if (!stats[key]) {
        stats[key] = {
          clientsCount: 0,
          uniqueClients: new Set(),
          totalAmount: 0,
        };
      }

      stats[key].uniqueClients.add(booking.fullName);

      // Считаем стоимость процедур для этого бронирования
      booking.procedures.forEach((procedure) => {
        const price = getProcedurePrice(
          procedure.category,
          procedure.procedure
        );
        if (price > 0) {
          stats[key].totalAmount += price;
        } else {
          console.log(`Ошибка в цене для процедури: ${procedure.procedure}`);
        }
      });

      stats[key].clientsCount = stats[key].uniqueClients.size;

      return stats;
    }, {});

    return monthlyStats;
  } catch (error) {
    console.error("Помилка отримання статистики за місяць:", error);
    return {};
  }
};
