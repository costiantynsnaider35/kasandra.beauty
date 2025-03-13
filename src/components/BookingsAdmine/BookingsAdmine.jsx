import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/uk";
import s from "./BookingsAdmine.module.css";
import { FaCircleArrowLeft, FaCircleArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Logout from "../Logout/Logout";
import { getHolidays } from "../../Firebase/firebaseHolidays.js";
import { getAllBookingDates } from "../../Firebase/firebaseBookings.js";
import toast from "react-hot-toast";

dayjs.locale("uk");

const BookingsAdmine = () => {
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
          const formattedDate = day.format("YYYY-MM-DD");
          const isNonWorking = holidays.includes(formattedDate);
          const isToday = day.isSame(dayjs(), "day");
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
    </div>
  );
};

export default BookingsAdmine;
