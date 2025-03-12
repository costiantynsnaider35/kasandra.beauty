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
    return [...new Set(dates)]; // Убираем дубли
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

const canUserModifyBooking = async (bookingId) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Користувач не авторизований!");

  const bookingRef = doc(db, "bookings", bookingId);
  const bookingSnap = await getDoc(bookingRef);

  if (!bookingSnap.exists()) throw new Error("Запис не знайдений!");

  const bookingData = bookingSnap.data();

  const admin = await isAdmin(user.uid);

  return admin || bookingData.uid === user.uid;
};

export const updateBooking = async (id, updatedBooking) => {
  try {
    const bookingRef = doc(db, "bookings", id);
    await updateDoc(bookingRef, updatedBooking);
    toast.success("Запис успішно оновлено!");
  } catch (error) {
    toast.error("Помилка при оновленні запису");
    throw new Error(error.message);
  }
};

export const deleteBooking = async (id) => {
  try {
    if (!(await canUserModifyBooking(id))) {
      throw new Error("Недостатньо прав для видалення!");
    }
    await deleteDoc(doc(db, "bookings", id));
    toast.success("Запис до майстра успішно видалено!");
  } catch (error) {
    toast.error(error.message || "Не вдалося видалити запис до майстра!");
    throw new Error(error.message);
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
