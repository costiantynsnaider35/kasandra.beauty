import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  addBooking,
  deleteBooking,
  fetchBookings,
  updateBooking,
} from "@/api/bookings";
import { procedureDurations } from "@/constants/procedureDurations";
import ProcedureSelector from "@/components/ProcedureSelector";
import s from "./DayBookings.module.scss";

const DayBookings = ({ date }) => {
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    procedures: [],
    time: "",
    comment: "",
  });
  const [editingTimeId, setEditingTimeId] = useState(null);
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      const dayBookings = await fetchBookings(date);
      setBookings(dayBookings);
    };
    loadBookings();
  }, [date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProcedureChange = (category, newProcedures) => {
    setFormData((prev) => {
      const filtered = prev.procedures.filter((p) => p.category !== category);
      return {
        ...prev,
        procedures: [...filtered, ...newProcedures],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      formData.procedures.length === 0 ||
      !formData.time
    ) {
      toast.error("Заповніть всі обов’язкові поля!");
      return;
    }

    const timeString = formData.time.trim();
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(timeString)) {
      toast.error("Невірний формат часу. Введіть час у форматі HH:mm!");
      return;
    }

    const selectedTime = dayjs(`${date} ${timeString}`, "YYYY-MM-DD HH:mm");

    if (!selectedTime.isValid()) {
      toast.error("Невірний формат часу. Введіть час у форматі HH:mm!");
      return;
    }

    const currentTime = dayjs();
    if (selectedTime.isBefore(currentTime, "minute")) {
      toast.error("Час не може бути в минулому!");
      return;
    }

    const totalDuration = formData.procedures.reduce(
      (acc, { category, procedure }) => {
        return acc + (procedureDurations[category][procedure] || 0);
      },
      0
    );

    const newBooking = { ...formData, date, duration: totalDuration };

    try {
      const createdBooking = await addBooking(newBooking);
      setBookings((prevBookings) => [...prevBookings, createdBooking]);

      setFormData({
        fullName: "",
        phoneNumber: "",
        procedures: [],
        time: "",
        comment: "",
      });
    } catch {
      toast.error("Помилка під час запису клієнта");
    }
  };

  const handleDelete = async (id) => {
    await deleteBooking(id);
    setBookings((prevBookings) =>
      prevBookings.filter((booking) => booking.id !== id)
    );
  };

  const handleSubmitTime = async (bookingId) => {
    const timeString = newTime.trim();
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(timeString)) {
      toast.error("Невірний формат часу. Введіть час у форматі HH:mm!");
      return;
    }

    const selectedTime = dayjs(`${date} ${timeString}`, "YYYY-MM-DD HH:mm");

    if (!selectedTime.isValid()) {
      toast.error("Невірний формат часу. Введіть час у форматі HH:mm!");
      return;
    }

    const currentTime = dayjs();
    if (selectedTime.isBefore(currentTime, "minute")) {
      toast.error("Час не може бути в минулому!");
      return;
    }

    const updatedBooking = {
      id: bookingId,
      time: newTime,
    };

    try {
      await updateBooking(bookingId, updatedBooking);
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, time: newTime } : booking
        )
      );
      setEditingTimeId(null);
      setNewTime("");
    } catch {
      toast.error("Не вдалося оновити час запису");
    }
  };

  return (
    <div className={s.wrapper}>
      <h2>Записи на {date}</h2>
      <form onSubmit={handleSubmit} className={s.adminForm}>
        <label className={s.adminFormLabel}>
          Ім’я клієнта:
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={s.adminFormInput}
            required
          />
        </label>

        <label className={s.adminFormLabel}>
          Номер телефону:
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={s.adminFormInput}
          />
        </label>

        <label className={s.adminFormLabel}>
          Час:
          <input
            type="text"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={s.adminFormInput}
            placeholder="HH:mm"
            required
          />
        </label>

        <ProcedureSelector
          selectedProcedures={formData.procedures}
          onChange={handleProcedureChange}
        />

        <label className={s.adminFormLabel}>
          Коментар:
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            className={s.adminFormTextarea}
          ></textarea>
        </label>

        <button type="submit" className={s.adminFormButton}>
          Додати запис
        </button>
      </form>

      <ul className={s.bookingsList}>
        {bookings.map((booking) => (
          <li key={booking.id} className={s.bookingItem}>
            <p>Ім’я: {booking.fullName}</p>
            <p>Телефон: {booking.phoneNumber}</p>
            <p>
              Процедури: {booking.procedures.map((p) => p.procedure).join(", ")}
            </p>
            <p>Час: {booking.time}</p>
            <p>Коментар: {booking.comment}</p>
            <button
              onClick={() => handleDelete(booking.id)}
              className={s.deleteButton}
            >
              Видалити
            </button>

            {editingTimeId === booking.id ? (
              <div>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="HH:mm"
                />
                <button onClick={() => handleSubmitTime(booking.id)}>
                  Зберегти
                </button>
              </div>
            ) : (
              <button onClick={() => setEditingTimeId(booking.id)}>
                Редагувати час
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DayBookings;
