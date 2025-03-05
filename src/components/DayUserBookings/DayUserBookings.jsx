import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import "dayjs/locale/uk";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  getBookingsByDate,
  addBooking,
  deleteBooking,
  updateBooking,
  findBookingByUidAndDate,
} from "../../Firebase/firebaseBookings.js";
import { checkAuthState } from "../../Firebase/firebaseService.js";
import s from "./DayUserBookings.module.css";

dayjs.locale("uk");
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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
  }, [formattedDate, date]);

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

  const handleCheckboxChange = (category, procedure) => (event) => {
    const isChecked = event.target.checked;
    setFormData((prevData) => {
      const updatedProcedures = isChecked
        ? [...prevData.procedures, { category, procedure }]
        : prevData.procedures.filter((p) => p.procedure !== procedure);

      return { ...prevData, procedures: updatedProcedures };
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

    const selectedTime = dayjs(
      `${formattedDate} ${timeString}`,
      "YYYY-MM-DD HH:mm"
    );

    if (!selectedTime.isValid()) {
      toast.error("Невірний формат часу. Введіть час у форматі HH:mm!");
      return;
    }

    const startTime = dayjs(`${formattedDate} 09:00`, "YYYY-MM-DD HH:mm");
    const endTime = dayjs(`${formattedDate} 19:00`, "YYYY-MM-DD HH:mm");

    // Проверка на время в прошлом
    const currentTime = dayjs(); // Текущее время
    if (selectedTime.isBefore(currentTime, "minute")) {
      toast.error("Час не може бути в минулому!");
      return;
    }

    if (
      !selectedTime.isSameOrAfter(startTime) ||
      !selectedTime.isSameOrBefore(endTime)
    ) {
      toast.error("Запис можливий лише з 09:00 до 19:00!");
      return;
    }

    if (editingBookingId) {
      const editingBookingTime = dayjs(formData.time, "HH:mm");

      // Дополнительная проверка для редактирования
      if (editingBookingTime.isBefore(currentTime, "minute")) {
        toast.error("Час не може бути в минулому для оновлення запису!");
        return;
      }
    }

    // Проверка, занято ли время
    const isTimeBooked = bookings.some(
      (booking) =>
        booking.time === formData.time && booking.uid !== editingBookingId
    );
    if (isTimeBooked) {
      toast.error("Цей час вже зайнятий! Виберіть інший.");
      return;
    }

    const newBooking = { ...formData, date: formattedDate, uid: userId };

    try {
      if (editingBookingId) {
        const docId = await findBookingByUidAndDate(
          editingBookingId,
          date || formattedDate
        );
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
      } else {
        const addedBooking = await addBooking(newBooking);
        if (addedBooking) {
          setBookings([...bookings, addedBooking]);
        }
      }
    } catch {
      toast.error;
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

  const handleDelete = async (uid, date) => {
    try {
      const docId = await findBookingByUidAndDate(uid, date);

      if (docId) {
        await deleteBooking(docId);
        setBookings((prev) =>
          prev.filter((booking) => booking.uid !== uid && booking.date !== date)
        );
      } else {
        toast.error;
      }
    } catch {
      toast.error;
    }
  };

  const handleEdit = async (uid) => {
    setEditingBookingId(uid);
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
                  {Object.entries(
                    booking.procedures.reduce(
                      (acc, { category, procedure }) => {
                        if (!acc[category]) {
                          acc[category] = [];
                        }
                        acc[category].push(procedure);
                        return acc;
                      },
                      {}
                    )
                  ).map(([category, procedures]) => (
                    <p key={category} className={s.procBookings}>
                      <strong>{category}:</strong> {procedures.join(", ")}
                    </p>
                  ))}
                  <div className={s.containerBtn}>
                    <button
                      className={s.regBtn}
                      onClick={() => handleEdit(booking.uid)}
                    >
                      Редагувати
                    </button>
                    <button
                      className={s.delBtn}
                      onClick={() => handleDelete(booking.uid, booking.date)}
                    >
                      Видалити
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>На {booking.time} є клієнт!</p>
                  {/* {booking.procedures.map((proc, index) => (
                    <p key={index}>
                      {proc.category} - {proc.procedure}
                    </p>
                  ))} */}
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
                        checked={formData.procedures.some(
                          (p) => p.procedure === option
                        )}
                        onChange={handleCheckboxChange(
                          category.category,
                          option
                        )}
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
            min="09:00"
            max="19:00"
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
