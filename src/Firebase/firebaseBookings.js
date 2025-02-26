import { db } from "./firebaseConfig.js";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export const getBookingsByDate = async (date) => {
  try {
    const q = query(collection(db, "bookings"), where("date", "==", date));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName:
          data.fullName || `${data.name || ""} ${data.surname || ""}`.trim(),
        phoneNumber: data.phoneNumber || data.phone,
        procedures: Array.isArray(data.procedure)
          ? data.procedure
          : [data.procedure],
        time: data.time,
        comment: data.comment || "",
        date: data.date,
      };
    });
  } catch (error) {
    console.error("Ошибка получения записей:", error);
    return [];
  }
};

export const addBooking = async (bookingData) => {
  try {
    const docRef = await addDoc(collection(db, "bookings"), {
      fullName: bookingData.fullName,
      phoneNumber: bookingData.phoneNumber,
      procedures: bookingData.procedures,
      time: bookingData.time,
      comment: bookingData.comment || "",
      date: bookingData.date,
    });
    return { id: docRef.id, ...bookingData };
  } catch (error) {
    console.error("Ошибка при добавлении записи:", error);
    return null;
  }
};
