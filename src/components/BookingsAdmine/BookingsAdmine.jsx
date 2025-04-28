import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/uk";
import weekday from "dayjs/plugin/weekday";
import s from "./BookingsAdmine.module.css";
import { FaCircleArrowLeft, FaCircleArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Logout from "../Logout/Logout";
import { getHolidays } from "../../Firebase/firebaseHolidays.js";
import {
  deleteOldBookings,
  getAllBookingDates,
} from "../../Firebase/firebaseBookings.js";
import toast from "react-hot-toast";
import Developer from "../Developer/Developer.jsx";
import { motion } from "framer-motion";

dayjs.locale("uk");
dayjs.extend(weekday);

const BookingsAdmine = ({ setCurrentMonth }) => {
  // Получаем setCurrentMonth как пропс
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [holidays, setHolidays] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const holidayDates = await getHolidays();
        setHolidays(holidayDates);

        const bookingDates = await getAllBookingDates();
        setBookedDates(bookingDates);
      } catch {
        toast.error("Не вдалося отримати дані. Спробуйте пізніше.");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    deleteOldBookings();
  }, []);

  // Обновляем месяц в родительском компоненте
  useEffect(() => {
    const monthKey = `${currentDate.year()}-${currentDate.month() + 1}`;
    setCurrentMonth(monthKey); // Отправляем текущий месяц родительскому компоненту
  }, [currentDate, setCurrentMonth]);

  const generateDays = (currentDate) => {
    const startOfMonth = currentDate.startOf("month");
    const startOfWeek = startOfMonth.weekday();
    const endOfMonth = currentDate.endOf("month").endOf("week");
    const days = [];
    let day = startOfMonth;

    for (let i = 0; i < startOfWeek; i++) {
      days.push(null);
    }

    while (day.isBefore(endOfMonth, "day")) {
      if (day.month() === currentDate.month()) {
        days.push(day);
      } else {
        break;
      }
      day = day.add(1, "day");
    }

    return days;
  };

  const handlePrevMonth = () =>
    setCurrentDate(currentDate.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));
  const handleDayClick = (day) =>
    navigate(`/admin/day/${day.format("YYYY-MM-DD")}`);

  return (
    <div className={s.bookingsContainer}>
      <div className={s.calendarHeader}>
        <motion.button onClick={handlePrevMonth} whileTap={{ scale: 0.9 }}>
          <FaCircleArrowLeft />
        </motion.button>
        <motion.h2
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(e, { offset }) => {
            if (offset.x > 100) {
              handlePrevMonth();
            } else if (offset.x < -100) {
              handleNextMonth();
            }
          }}
          whileTap={{ scale: 0.95 }}
        >
          {currentDate.format("MM.YYYY")}
        </motion.h2>
        <motion.button onClick={handleNextMonth} whileTap={{ scale: 0.9 }}>
          <FaCircleArrowRight />
        </motion.button>
      </div>

      <motion.div
        className={s.calendarGrid}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(e, { offset }) => {
          if (offset.x > 100) {
            handlePrevMonth();
          } else if (offset.x < -100) {
            handleNextMonth();
          }
        }}
      >
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((day, index) => (
          <div key={index} className={s.weekday}>
            {day}
          </div>
        ))}

        {generateDays(currentDate).map((day, index) => {
          if (day === null) {
            return <div key={index} className={s.emptyDay}></div>;
          }

          const formattedDate = day.format("YYYY-MM-DD");
          const isNonWorking = holidays.includes(formattedDate);
          const isToday = day.isSame(dayjs(), "date");
          const isBooked = bookedDates.includes(formattedDate);

          return (
            <div
              key={index}
              className={`${s.day} ${isNonWorking ? s.nonWorkingDay : ""} 
                ${isToday ? s.today : ""} ${isBooked ? s.bookedDay : ""}`}
              onClick={() => handleDayClick(day)}
            >
              {day.date()}
            </div>
          );
        })}
      </motion.div>

      <div className={s.legend}>
        <div className={s.legendItem}>
          <div className={s.workingDay}></div>
          <span>Робочий день</span>
        </div>
        <div className={s.legendItem}>
          <div className={s.nonWorkingDay}></div>
          <span>Не робочий день</span>
        </div>
      </div>
      <Logout />
      <Developer />
    </div>
  );
};

export default BookingsAdmine;
