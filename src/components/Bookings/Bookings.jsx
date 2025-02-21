import dayjs from "dayjs";
import "dayjs/locale/uk";
import s from "./Bookings.module.css";
import { useState } from "react";
import { FaCircleArrowLeft } from "react-icons/fa6";
import { FaCircleArrowRight } from "react-icons/fa6";
import Logout from "../Logout/Logout";

dayjs.locale("uk");

const Bookings = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());

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

  return (
    <div className={s.bookingsContainer}>
      <div className={s.calendarHeader}>
        <button onClick={handlePrevMonth}>{<FaCircleArrowLeft />}</button>
        <h2>{currentDate.format("MMMM YYYY")}</h2>
        <button onClick={handleNextMonth}>{<FaCircleArrowRight />}</button>
      </div>
      <div className={s.calendarGrid}>
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((day, index) => (
          <div key={index} className={s.weekday}>
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div
            key={index}
            className={`${s.day} ${
              day.isSame(currentDate, "month") ? "" : s.outsideMonth
            } ${day.isSame(dayjs(), "day") ? s.today : ""}`}
          >
            {day.date()}
          </div>
        ))}
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

export default Bookings;
