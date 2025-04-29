import { useState, useEffect } from "react";
import { getMonthlyStats } from "../../Firebase/firebaseBookings.js";
import s from "./Admin.module.css";
import BookingsAdmine from "../BookingsAdmine/BookingsAdmine.jsx";

const Admin = () => {
  const [clientsCount, setClientsCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [currentMonth, setCurrentMonth] = useState("");

  useEffect(() => {
    const fetchMonthlyStats = async () => {
      const stats = await getMonthlyStats();

      if (currentMonth) {
        const monthKey = currentMonth;
        if (stats[monthKey]) {
          setClientsCount(stats[monthKey].clientsCount);
          setTotalAmount(stats[monthKey].totalAmount);
        } else {
          setClientsCount(0);
          setTotalAmount(0);
        }
      }
    };

    fetchMonthlyStats();
  }, [currentMonth]);

  return (
    <div className={s.adminContainer}>
      <p>Кількість клієнтів за місяць: {clientsCount}</p>
      <p>Приблизна сума за місяць: {totalAmount} грн</p>
      <BookingsAdmine setCurrentMonth={setCurrentMonth} />
    </div>
  );
};

export default Admin;
