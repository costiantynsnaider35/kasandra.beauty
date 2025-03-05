import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getHolidays,
  addHoliday,
  deleteHoliday,
} from "../../Firebase/firebaseHolidays.js";
import {
  deleteBooking,
  findBookingByUidAndDate,
  getBookingsByDate,
  updateBooking,
} from "../../Firebase/firebaseBookings.js";
import dayjs from "dayjs";
import "dayjs/locale/uk";
import s from "./DayBookings.module.css";
import { toast } from "react-hot-toast";

dayjs.locale("uk");

const DayBookings = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [isNonWorking, setIsNonWorking] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [editingTimeId, setEditingTimeId] = useState(null);
  const [newTime, setNewTime] = useState("");

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
  const handleDelete = async (id) => {
    try {
      const docId = await findBookingByUidAndDate(id);

      if (docId) {
        await deleteBooking(docId);
        setBookings((prev) => prev.filter((booking) => booking.uid !== id));
      } else {
        toast.error;
      }
    } catch {
      toast.error;
    }
  };

  return (
    <div className={s.dayContainer}>
      <h2>{dayjs(date).format("DD MMMM YYYY")}</h2>

      <div className={s.buttonGroup}>
        <button
          className={`${s.button} ${!isNonWorking ? s.working : ""}`}
          onClick={handleSetWorkingDay}
        >
          Робочий день
        </button>
        <button
          className={`${s.button} ${isNonWorking ? s.nonWorking : ""}`}
          onClick={handleSetNonWorkingDay}
        >
          Не робочий день
        </button>
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

      <button className={s.backButton} onClick={() => navigate("/admin")}>
        Назад
      </button>
    </div>
  );
};

export default DayBookings;
