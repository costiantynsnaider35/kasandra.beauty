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
import { getBreaks } from "../../Firebase/firebaseBreaks.js";
import s from "./DayUserBookings.module.css";

dayjs.locale("uk");
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const proceduresList = [
  {
    category: "Манікюр",
    options: [
      "корекція 1-го нігтя",
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

const procedureDurations = {
  Манікюр: {
    "корекція 1-го нігтя": 40,
    "без покриття": 60,
    "з покриттям": 120,
    "корекція нарощених нігтів": 210,
    нарощування: 210,
    "арт френч": 420,
    чоловічий: 60,
  },
  Педикюр: {
    чищення: 60,
    подологічний: 60,
    "з покриттям": 120,
    чоловічий: 60,
  },
  Брови: {
    "корекція воском": 30,
    "корекція з фарбуванням": 60,
  },
};

const DayUserBookings = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const selectedDate = date ? dayjs(date) : dayjs();
  const formattedDate = selectedDate.format("YYYY-MM-DD");
  const displayDate = selectedDate.format("D MMMM");
  const [bookings, setBookings] = useState([]);
  const [breaks, setBreaks] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    procedures: [],
    time: "",
    comment: "",
  });
  const [openIndex, setOpenIndex] = useState(null);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const combinedList = [
    ...bookings.map((booking) => ({
      type: "booking",
      id: booking.id,
      startTime: dayjs(`${formattedDate} ${booking.time}`, "YYYY-MM-DD HH:mm"),
      endTime: dayjs(
        `${formattedDate} ${booking.time}`,
        "YYYY-MM-DD HH:mm"
      ).add(booking.duration, "minute"),
      data: booking,
    })),
    ...breaks.map((breakItem) => ({
      type: "break",
      id: breakItem.id,
      startTime: dayjs(
        `${formattedDate} ${breakItem.start}`,
        "YYYY-MM-DD HH:mm"
      ),
      endTime: dayjs(`${formattedDate} ${breakItem.end}`, "YYYY-MM-DD HH:mm"),
      data: breakItem,
    })),
  ].sort((a, b) => a.startTime - b.startTime);

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
    const fetchBreaks = async () => {
      const breaksList = await getBreaks();
      setBreaks(breaksList);
    };

    fetchBreaks();
  }, []);

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

  const handleChange = (e) => {
    const value = e.target.value;

    const regex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
    if (regex.test(value) || value === "") {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: value,
      }));
    }
  };

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

    const currentTime = dayjs();
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

      if (editingBookingTime.isBefore(currentTime, "minute")) {
        toast.error("Час не може бути в минулому для оновлення запису!");
        return;
      }
    }

    const totalDuration = formData.procedures.reduce(
      (acc, { category, procedure }) => {
        return acc + (procedureDurations[category][procedure] || 0);
      },
      0
    );
    const endTimeProcedure = selectedTime.add(totalDuration, "minute");

    const isTimeBooked = bookings.some((booking) => {
      if (booking.uid === editingBookingId) return false;

      const bookingStart = dayjs(
        `${formattedDate} ${booking.time}`,
        "YYYY-MM-DD HH:mm"
      );
      const bookingEnd = bookingStart.add(booking.duration, "minute");

      return (
        (selectedTime.isSameOrAfter(bookingStart) &&
          selectedTime.isBefore(bookingEnd)) ||
        (endTimeProcedure.isAfter(bookingStart) &&
          endTimeProcedure.isSameOrBefore(bookingEnd)) ||
        (selectedTime.isSameOrBefore(bookingStart) &&
          endTimeProcedure.isSameOrAfter(bookingEnd))
      );
    });

    if (isTimeBooked) {
      toast.error("Цей час перетинається з іншим записом! Виберіть інший час.");
      return;
    }

    const isTimeInBreak = breaks.some((breakItem) => {
      const breakStart = dayjs(
        `${formattedDate} ${breakItem.start}`,
        "YYYY-MM-DD HH:mm"
      );
      const breakEnd = dayjs(
        `${formattedDate} ${breakItem.end}`,
        "YYYY-MM-DD HH:mm"
      );

      return (
        (selectedTime.isSameOrAfter(breakStart) &&
          selectedTime.isBefore(breakEnd)) ||
        (endTimeProcedure.isAfter(breakStart) &&
          endTimeProcedure.isSameOrBefore(breakEnd)) ||
        (selectedTime.isSameOrBefore(breakStart) &&
          endTimeProcedure.isSameOrAfter(breakEnd))
      );
    });

    if (isTimeInBreak) {
      toast.error("Запис перетинається з перервою! Виберіть інший час.");
      return;
    }

    const newBooking = {
      ...formData,
      date: formattedDate,
      uid: userId,
      duration: totalDuration,
      endTime: endTimeProcedure.format("HH:mm"),
    };

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
          duration: totalDuration,
          endTime: endTimeProcedure.format("HH:mm"),
          id: docId,
        };
        await updateBooking(docId, updatedBooking);

        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.uid === userId ? updatedBooking : booking
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
      {combinedList.length > 0 ? (
        <ul className={s.bookingList}>
          {combinedList.map((item) => {
            if (item.type === "booking") {
              const { data: booking } = item;
              return (
                <li key={booking.id} className={s.bookingItem}>
                  {booking.uid === userId ? (
                    <>
                      <p className={s.timeBookings}>
                        Час: ~{booking.time} - {item.endTime.format("HH:mm")}
                      </p>
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
                          onClick={() =>
                            handleDelete(booking.uid, booking.date)
                          }
                        >
                          Видалити
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className={s.timeBookings}>
                      З {booking.time} до {item.endTime.format("HH:mm")} є
                      клієнт!
                    </p>
                  )}
                </li>
              );
            } else if (item.type === "break") {
              const { data: breakItem } = item;
              return (
                <li key={breakItem.id} className={s.bookingItem}>
                  Перерва з {breakItem.start} до {breakItem.end}
                </li>
              );
            }
            return null;
          })}
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
            type="text"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            pattern="([01]?[0-9]|2[0-3]):([0-5]?[0-9])"
            title="Введите время в формате HH:mm"
            placeholder="HH:mm"
            className={s.timeAdminInput}
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
