import dayjs from "dayjs";
import "dayjs/locale/uk";
import s from "./Bookings.module.css";
import { useState, useEffect } from "react";
import { FaCircleArrowLeft, FaCircleArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { getHolidays } from "../../Firebase/firebaseHolidays.js";
import Logout from "../Logout/Logout";
import Developer from "../Developer/Developer.jsx";

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
        <button onClick={handlePrevMonth}>
          <FaCircleArrowLeft />
        </button>
        <h2>{currentDate.format("MMMM YYYY")}</h2>
        <button onClick={handleNextMonth}>
          <FaCircleArrowRight />
        </button>
      </div>

      <div className={s.calendarGrid}>
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
      </div>

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
