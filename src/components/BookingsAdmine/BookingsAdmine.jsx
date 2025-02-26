import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/uk";
import s from "./BookingsAdmine.module.css";
import { FaCircleArrowLeft, FaCircleArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Logout from "../Logout/Logout";
import { getHolidays } from "../../firebaseHolidays";

dayjs.locale("uk");

const BookingsAdmine = () => {
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

  const handlePrevMonth = () =>
    setCurrentDate(currentDate.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));
  const handleDayClick = (day) =>
    navigate(`/admin/day/${day.format("YYYY-MM-DD")}`);

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
        {generateDays(currentDate).map((day, index) => {
          const isNonWorking = holidays.includes(day.format("YYYY-MM-DD"));
          return (
            <div
              key={index}
              className={`${s.day} ${isNonWorking ? s.nonWorkingDay : ""}`}
              onClick={() => handleDayClick(day)}
            >
              {day.date()}
            </div>
          );
        })}
      </div>
      <div className={s.legend}>
        <div className={s.legendItem}>
          <div className={s.workingDay}></div>
          <span>Робочий день!</span>
        </div>
        <div className={s.legendItem}>
          <div className={s.nonWorkingDay}></div>
          <span>Не робочий день!</span>
        </div>
      </div>
      <Logout />
    </div>
  );
};
export default BookingsAdmine;
