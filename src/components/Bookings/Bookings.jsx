import dayjs from "dayjs";
import "dayjs/locale/uk";
import s from "./Bookings.module.css";
import { useState, useEffect } from "react";
import { FaCircleArrowLeft, FaCircleArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { getHolidays } from "../../Firebase/firebaseHolidays.js";
import Logout from "../Logout/Logout";
import Developer from "../Developer/Developer.jsx";
import { motion } from "framer-motion";

dayjs.locale("uk");

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
    const startOfMonth = currentDate.startOf("month").startOf("week");
    const endOfMonth = currentDate.endOf("month").endOf("week");

    const days = [];
    let day = startOfMonth;

    while (day.isBefore(endOfMonth, "day")) {
      days.push(day);
      day = day.add(1, "day");
    }

    return days;
  };

  const days = generateDays(currentDate);

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, "month"));
  };

  const handleDayClick = (day) => {
    const formattedDate = day.format("YYYY-MM-DD");
    navigate(`/bookings/day/${formattedDate}`);
  };

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

        {days.map((day, index) => {
          const isToday = day.isSame(dayjs(), "day");
          const isCurrentMonth = day.isSame(currentDate, "month");
          const isHoliday = holidays.includes(day.format("YYYY-MM-DD"));

          return (
            <div
              key={index}
              className={`${s.day} ${isCurrentMonth ? "" : s.outsideMonth} ${
                isToday ? s.today : ""
              } ${isHoliday ? s.nonWorkingDay : ""}`}
              onClick={!isHoliday ? () => handleDayClick(day) : undefined}
              style={isHoliday ? { pointerEvents: "none", opacity: 0.5 } : {}}
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
