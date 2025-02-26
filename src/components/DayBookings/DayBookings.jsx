import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getHolidays,
  addHoliday,
  deleteHoliday,
} from "../../Firebase/firebaseHolidays.js";
import dayjs from "dayjs";
import s from "./DayBookings.module.css";

const DayBookings = () => {
  const { date } = useParams();
  const [isNonWorking, setIsNonWorking] = useState(false);

  useEffect(() => {
    const fetchHolidays = async () => {
      const holidays = await getHolidays();
      setIsNonWorking(holidays.includes(date));
    };
    fetchHolidays();
  }, [date]);

  const toggleNonWorkingDay = async () => {
    if (isNonWorking) {
      await deleteHoliday(date);
    } else {
      await addHoliday(date);
    }
    setIsNonWorking(!isNonWorking);
  };

  return (
    <div className={s.container}>
      <h2>Налаштування дня {dayjs(date).format("DD MMMM YYYY")}</h2>
      <button
        onClick={toggleNonWorkingDay}
        className={isNonWorking ? s.nonWorking : s.working}
      >
        {isNonWorking ? "Зробити робочим" : "Зробити вихідним"}
      </button>
    </div>
  );
};
export default DayBookings;
