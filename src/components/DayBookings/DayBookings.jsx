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

        // Добавляем логирование данных до и после их форматирования
        console.log("Bookings Data:", bookingsData);

        const formattedBookings = bookingsData.map((booking) => {
          // Логирование до форматирования

          const procedures = Array.isArray(booking.procedures)
            ? booking.procedures
            : [booking.procedures]; // Исправлено на 'procedures'

          // Логирование после обработки процедур

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
              <div>
                <strong>Час:</strong> {booking.time}
              </div>
              <div>
                <strong>Клієнт:</strong> {booking.fullName}
              </div>
              <div>
                <strong>Телефон:</strong> {booking.phoneNumber}
              </div>

              <div>
                {booking.procedures.map((proc, index) => (
                  <p key={index} className={s.procBookings}>
                    Процедура:{proc.category}:{proc.procedure}
                  </p>
                ))}
              </div>

              {booking.comment && (
                <div>
                  <strong>Коментар:</strong> {booking.comment}
                </div>
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
