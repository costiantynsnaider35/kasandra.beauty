import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getHolidays,
  addHoliday,
  deleteHoliday,
} from "../../Firebase/firebaseHolidays.js";
import {
  deleteBooking,
  getBookingsByDate,
  updateBooking,
  addBooking, // Добавим функцию для добавления новой записи
} from "../../Firebase/firebaseBookings.js";
import dayjs from "dayjs";
import "dayjs/locale/uk";
import s from "./DayBookings.module.css";
import { toast } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { addBreak, getBreaks } from "../../Firebase/firebaseBreaks.js";

dayjs.locale("uk");

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

const DayBookings = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [isNonWorking, setIsNonWorking] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [editingTimeId, setEditingTimeId] = useState(null);
  const [newTime, setNewTime] = useState("");
  const [openIndex, setOpenIndex] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    procedures: [],
    time: "",
  });
  const [breakTime, setBreakTime] = useState({ start: "", end: "" });
  const [breaks, setBreaks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const holidays = await getHolidays();
        setIsNonWorking(holidays.includes(date));

        const bookingsData = await getBookingsByDate(date);

        const formattedBookings = bookingsData.map((booking) => {
          const procedures = Array.isArray(booking.procedures)
            ? booking.procedures
            : [booking.procedures];

          return {
            id: booking.id,
            fullName: booking.fullName,
            phoneNumber: booking.phoneNumber,
            procedures: procedures,
            time: booking.time,
            comment: booking.comment || "",
          };
        });

        setBookings(formattedBookings);
      } catch {
        console.error("Error fetching data");
      }
    };
    fetchData();
  }, [date]);

  useEffect(() => {
    const fetchBreaks = async () => {
      const breaksList = await getBreaks();
      setBreaks(breaksList);
    };

    fetchBreaks();
  }, []);

  const handleSetWorkingDay = async () => {
    if (isNonWorking) {
      await deleteHoliday(date);
      setIsNonWorking(false);
    }
  };

  const handleSetNonWorkingDay = async () => {
    if (!isNonWorking) {
      await addHoliday(date);
      setIsNonWorking(true);
    }
  };

  const handleEditTime = (bookingId, currentTime) => {
    setEditingTimeId(bookingId);
    setNewTime(currentTime);
  };

  const handleTimeChange = (e) => {
    setNewTime(e.target.value);
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

    const isTimeBooked = bookings.some(
      (booking) => booking.time === newTime && booking.id !== bookingId
    );
    if (isTimeBooked) {
      toast.error("Цей час вже зайнятий! Виберіть інший.");
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
      toast.error;
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      await deleteBooking(bookingId);

      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking.id !== bookingId)
      );
    } catch {
      toast.error;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
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

    const isTimeBooked = bookings.some(
      (booking) => booking.time === formData.time
    );
    if (isTimeBooked) {
      toast.error("Цей час вже зайнятий! Виберіть інший.");
      return;
    }

    const newBooking = { ...formData, date };

    try {
      await addBooking(newBooking);

      setBookings((prevBookings) => [
        ...prevBookings,
        { ...newBooking, id: Date.now() }, // добавляем запись в локальный список
      ]);

      setFormData({
        fullName: "",
        phoneNumber: "",
        procedures: [],
        time: "",
        comment: "",
      });
    } catch {
      toast.error;
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

  const handleBreakTimeChange = (e) => {
    const { name, value } = e.target;
    setBreakTime((prev) => ({ ...prev, [name]: value }));
  };

  const handleSetBreak = async (e) => {
    e.preventDefault();
    if (!breakTime.start || !breakTime.end) {
      toast.error("Заповніть обидва поля часу для перерви!");
      return;
    }
    try {
      await addBreak(breakTime);
      setBreaks((prev) => [...prev, breakTime]);
      toast.success("Перерва встановлена!");
    } catch {
      toast.error("Помилка при встановленні перерви");
    }
  };

  return (
    <div className={s.dayContainer}>
      <h2>{dayjs(date).format("DD MMMM YYYY")}</h2>

      <div className={s.buttonGroup}>
        <button
          className={`${s.buttonAdminWork} ${
            !isNonWorking ? s.buttonAdminWorking : ""
          }`}
          onClick={handleSetWorkingDay}
        >
          Робочий день
        </button>
        <button
          className={`${s.buttonAdminWork} ${
            isNonWorking ? s.buttonAdminNonWorking : ""
          }`}
          onClick={handleSetNonWorkingDay}
        >
          Не робочий день
        </button>
      </div>
      <div className={s.breakContainer}>
        <h3>Перерва</h3>
        <form className={s.formBreak} onSubmit={handleSetBreak}>
          <div className={s.breakTimeContainer}>
            <label className={s.timeBreak}>
              З:
              <input
                type="time"
                name="start"
                value={breakTime.start}
                onChange={handleBreakTimeChange}
                required
                className={s.timeBreakInput}
              />
            </label>
            <label className={s.timeBreak}>
              До:
              <input
                type="time"
                name="end"
                value={breakTime.end}
                onChange={handleBreakTimeChange}
                required
                className={s.timeBreakInput}
              />
            </label>
          </div>

          <button
            type="submit"
            className={s.breakAddBtn}
            onClick={handleSetBreak}
          >
            Втановити перерву
          </button>
          <button
            type="submit"
            className={s.breakDelBtn}
            onClick={handleSetBreak}
          >
            Видалити перерву
          </button>
        </form>
        {breaks.length > 0 && (
          <ul>
            {breaks.map(
              (breakItem, index) =>
                breakItem.start &&
                breakItem.end && (
                  <li key={index}>
                    Перерва з {breakItem.start} до {breakItem.end}
                  </li>
                )
            )}
          </ul>
        )}
      </div>
      <h3>Список клієнтів на сьогодні:</h3>
      {bookings.length > 0 ? (
        <ul className={s.bookingList}>
          {bookings.map((booking) => (
            <li key={booking.id} className={s.bookingItem}>
              <div>
                <p>
                  Час:
                  {editingTimeId === booking.id ? (
                    <input
                      type="time"
                      name="time"
                      min="09:00"
                      max="19:00"
                      value={newTime}
                      onChange={handleTimeChange}
                      className={s.timeInput}
                    />
                  ) : (
                    <span>{booking.time}</span>
                  )}
                </p>
              </div>

              <div>
                <p>
                  Клієнт:<span>{booking.fullName}</span>
                </p>
              </div>
              <div>
                <p>
                  Телефон:
                  <a href={`tel:${booking.phoneNumber}`}>
                    {booking.phoneNumber}
                  </a>
                </p>
              </div>

              <div className={s.procProcedures}>
                {Object.entries(
                  booking.procedures.reduce((acc, { category, procedure }) => {
                    if (!acc[category]) {
                      acc[category] = [];
                    }
                    acc[category].push(procedure);
                    return acc;
                  }, {})
                ).map(([category, procedures]) => (
                  <div key={category}>
                    <p>
                      {category}:<span>{procedures.join(", ")}</span>
                    </p>
                  </div>
                ))}
              </div>

              {booking.comment && (
                <div>
                  <strong>Коментар:</strong> {booking.comment}
                </div>
              )}
              <div
                className={`${s.timeEdit} ${
                  editingTimeId === booking.id ? s.editing : ""
                }`}
              >
                {editingTimeId !== booking.id && (
                  <button
                    className={s.editBtn}
                    onClick={() => handleEditTime(booking.id, booking.time)}
                  >
                    Редагувати
                  </button>
                )}

                {editingTimeId === booking.id && (
                  <button
                    className={s.updateBtn}
                    onClick={() => handleSubmitTime(booking.id)}
                  >
                    Оновити запис
                  </button>
                )}

                <button
                  className={s.delBtn}
                  onClick={() => {
                    handleDelete(booking.id);
                  }}
                >
                  Видалити
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Записів немає</p>
      )}
      <form className={s.adminForm} onSubmit={handleSubmit}>
        <label className={s.adminFormLabel}>
          Ім’я та прізвище*:
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className={s.adminFormInput}
          />
        </label>
        <label className={s.adminFormLabel}>
          Номер телефону*:
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className={s.adminFormInput}
          />
        </label>
        {proceduresList.map((category, index) => (
          <div key={index}>
            <div
              className={s.accordionAdminHeader}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <strong className={s.categoryAdminTitle}>
                {category.category}
              </strong>
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
                    <label key={option} className={s.procedureAdminItem}>
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
                        className={s.procedureAdminCheckbox}
                      />
                      {option}
                    </label>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        <label className={s.timeAdminLabel}>
          Час*:
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className={s.timeAdminInput}
          />
        </label>
        <button type="submit" className={s.addAdminBtn}>
          Записати
        </button>
      </form>
      <button className={s.backAdminBtn} onClick={() => navigate(-1)}>
        Назад
      </button>
    </div>
  );
};

export default DayBookings;
