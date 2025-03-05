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
        console.error;
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
                <p>
                  Час:<span>{booking.time}</span>
                </p>
              </div>
              <div>
                <p>
                  Клієнт:<span>{booking.fullName}</span>
                </p>
              </div>
              <div>
                <p>
                  Телефон:<span>{booking.phoneNumber}</span>
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
