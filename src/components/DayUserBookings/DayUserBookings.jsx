import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/uk";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  getBookingsByDate,
  addBooking,
  deleteBooking,
  updateBooking,
  findBookingByUid,
} from "../../Firebase/firebaseBookings.js";
import { checkAuthState } from "../../Firebase/firebaseService.js";
import s from "./DayUserBookings.module.css";

dayjs.locale("uk");
dayjs.extend(localizedFormat);

const proceduresList = [
  {
    category: "Манікюр",
    options: [
      "зняття від іншого майстра",
      "корекція 1-го нігтя",
      "френч",
      "без покриття",
      "з покриттям",
      "корекція нарощених нігтів",
      "нарощування",
      "арт френч",
      "чоловічий",
    ],
  },
  {
    category: "Педикюр",
    options: ["чищення", "подологічний", "з покриттям", "чоловічий"],
  },
  { category: "Брови", options: ["корекція воском", "корекція з фарбуванням"] },
];

const DayUserBookings = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const selectedDate = date ? dayjs(date) : dayjs();
  const formattedDate = selectedDate.format("YYYY-MM-DD");
  const displayDate = selectedDate.format("D MMMM");
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    procedures: [],
    time: "",
    comment: "",
  });
  const [openIndex, setOpenIndex] = useState(null);
  const [editingBookingId, setEditingBookingId] = useState(null);

  useEffect(() => {
    checkAuthState((user) => {
      setUserId(user ? user.uid : null);
    });
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      const data = await getBookingsByDate(formattedDate);
      setBookings(data);
    };
    fetchBookings();
  }, [formattedDate]);

  useEffect(() => {
    if (editingBookingId) {
      const bookingToEdit = bookings.find(
        (booking) => booking.uid === editingBookingId
      );
      if (bookingToEdit) {
        setFormData({
          fullName: bookingToEdit.fullName,
          phoneNumber: bookingToEdit.phoneNumber,
          procedures: bookingToEdit.procedures,
          time: bookingToEdit.time,
          comment: bookingToEdit.comment,
        });
      }
    }
  }, [editingBookingId, bookings]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      procedures: checked
        ? [...prevState.procedures, value]
        : prevState.procedures.filter((proc) => proc !== value),
    }));
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
    if (!userId) {
      toast.error("Будь ласка, увійдіть, щоб записатися!");
      return;
    }

    const timeString = formData.time.trim();

    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(timeString)) {
      toast.error("Невірний формат часу. Введіть час у форматі HH:mm!");
      return;
    }

    const selectedTime = dayjs(timeString, "HH:mm", true);

    if (!selectedTime.isValid()) {
      toast.error("Невірний формат часу. Введіть час у форматі HH:mm!");
      return;
    }

    const startTime = dayjs("09:00", "HH:mm");
    const endTime = dayjs("19:00", "HH:mm");

    if (selectedTime.isBefore(startTime) || selectedTime.isAfter(endTime)) {
      toast.error("Запис можливий лише з 09:00 до 19:00!");
      return;
    }

    const newBooking = { ...formData, date: formattedDate, uid: userId };

    try {
      if (editingBookingId) {
        // Обновляем существующую запись
        const docId = await findBookingByUid(editingBookingId);
        const updatedBooking = {
          ...formData,
          date: formattedDate,
          uid: userId,
        };
        await updateBooking(docId, updatedBooking);

        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.uid === editingBookingId ? updatedBooking : booking
          )
        );
        toast.success("Запис успішно оновлено!");
      } else {
        const addedBooking = await addBooking(newBooking);
        if (addedBooking) {
          setBookings([...bookings, addedBooking]);
          toast.success("Запис успішно додано!");
        } else {
          toast.error("Сталася помилка при додаванні запису.");
        }
      }
    } catch {
      toast.error("Щось пішло не так. Спробуйте знову.");
    }

    setFormData({
      fullName: "",
      phoneNumber: "",
      procedures: [],
      time: "",
      comment: "",
    });
    setEditingBookingId(null);
  };

  const handleDelete = async (uid) => {
    try {
      console.log("Видалення запису з UID:", uid);

      const docId = await findBookingByUid(uid);
      console.log("Знайдений ID документа:", docId);

      await deleteBooking(docId);

      setBookings((prev) => prev.filter((booking) => booking.uid !== uid));

      console.log("Запис успішно видалено");
      toast.success("Запис успішно видалено!");
    } catch (error) {
      console.error("Помилка при видаленні запису:", error);
      toast.error("Сталася помилка при видаленні запису.");
    }
  };

  const handleEdit = async (uid) => {
    setEditingBookingId(uid); // Встановлюємо ID редагованої запису
  };

  return (
    <div className={s.container}>
      <h2>Записи на {displayDate}</h2>
      {bookings.length > 0 ? (
        <ul className={s.bookingList}>
          {bookings.map((booking) => (
            <li key={booking.uid} className={s.bookingItem}>
              {booking.uid === userId ? (
                <>
                  <p className={s.timeBookings}>Час: {booking.time}</p>
                  <p className={s.procBookings}>
                    Процедура: {booking.procedures.join(", ")}
                  </p>
                  <div className={s.containerBtn}>
                    <button
                      className={s.regBtn}
                      onClick={() => handleEdit(booking.uid)}
                    >
                      Редагувати
                    </button>
                    <button
                      className={s.delBtn}
                      onClick={() => handleDelete(booking.uid)}
                    >
                      Видалити
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <strong>{booking.fullName}</strong>
                  </p>
                  <p>Час: {booking.time}</p>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Немає записів</p>
      )}

      <form className={s.form} onSubmit={handleSubmit}>
        <label className={s.formLabel}>
          Ім’я та прізвище*:
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className={s.formInput}
          />
        </label>
        <label className={s.formLabel}>
          Номер телефону*:
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className={s.formInput}
          />
        </label>
        {proceduresList.map((category, index) => (
          <div key={index}>
            <div
              className={s.accordionHeader}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <strong className={s.categoryTitle}>{category.category}</strong>
            </div>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {category.options.map((option) => (
                    <label key={option} className={s.procedureItem}>
                      <input
                        type="checkbox"
                        name="procedures"
                        value={option}
                        checked={formData.procedures.includes(option)}
                        onChange={handleCheckboxChange}
                        className={s.procedureCheckbox}
                      />
                      {option}
                    </label>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        <label className={s.timeLabel}>
          Час*:
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className={s.timeInput}
          />
        </label>
        <label className={s.comLabel}>
          Коментар:
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            className={s.comInput}
          ></textarea>
        </label>
        <button className={s.addBtn} type="submit">
          {editingBookingId ? "Оновити запис" : "Записатися"}
        </button>
      </form>
      <button className={s.backButton} onClick={() => navigate(-1)}>
        Назад
      </button>
    </div>
  );
};

export default DayUserBookings;
