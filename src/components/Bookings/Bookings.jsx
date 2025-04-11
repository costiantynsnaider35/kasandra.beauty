import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/uk";
import weekday from "dayjs/plugin/weekday";
import s from "./Bookings.module.css";
import { FaCircleArrowLeft, FaCircleArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { getHolidays } from "../../Firebase/firebaseHolidays.js";
import Logout from "../Logout/Logout";
import Developer from "../Developer/Developer.jsx";
import { motion } from "framer-motion";

dayjs.locale("uk");
dayjs.extend(weekday);

const Bookings = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [holidays, setHolidays] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHolidays = async () => {
      const holidayDates = await getHolidays();
      setHolidays(holidayDates);
    };

    fetchHolidays();
  }, []);

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
      }
      day = day.add(1, "day");
    }

    return days;
  };

  const handlePrevMonth = () =>
    setCurrentDate(currentDate.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));
  const handleDayClick = (day) =>
    navigate(`/bookings/day/${day.format("YYYY-MM-DD")}`);

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

          return (
            <div
              key={index}
              className={`${s.day} ${isNonWorking ? s.nonWorkingDay : ""} 
                ${isToday ? s.today : ""}`}
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

export default Bookings;
