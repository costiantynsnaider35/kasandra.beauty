import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getHolidays,
  addHoliday,
  deleteHoliday,
} from "../../Firebase/firebaseHolidays.js";
import { getBookingsByDate } from "../../Firebase/firebaseBookings.js";
import dayjs from "dayjs";
import "dayjs/locale/uk";
import s from "./DayBookings.module.css";

dayjs.locale("uk");

const DayBookings = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [isNonWorking, setIsNonWorking] = useState(false);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const holidays = await getHolidays();
        setIsNonWorking(holidays.includes(date));

        const bookingsData = await getBookingsByDate(date);

        const formattedBookings = bookingsData.map((booking) => ({
          id: booking.id,
          fullName: booking.fullName,
          phoneNumber: booking.phoneNumber,
          procedures: Array.isArray(booking.procedure)
            ? booking.procedure
            : [booking.procedure],
          time: booking.time,
          comment: booking.comment || "",
        }));

        setBookings(formattedBookings);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
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
              <p>
                <strong>Клієнт:</strong> {booking.fullName}
              </p>
              <p>
                <strong>Телефон:</strong> {booking.phoneNumber}
              </p>
              <p>
                <strong>Процедури:</strong>
              </p>
              <ul className={s.procedureList}>
                {booking.procedures.map((procedure, index) => (
                  <li key={index} className={s.procedureItem}>
                    <input type="checkbox" checked disabled />
                    {procedure}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Час:</strong> {booking.time}
              </p>
              {booking.comment && (
                <p>
                  <strong>Коментар:</strong> {booking.comment}
                </p>
              )}
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
