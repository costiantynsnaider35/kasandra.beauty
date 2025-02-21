import Bookings from "../Bookings/Bookings";
import s from "./Admin.module.css";

const Admin = () => {
  return (
    <div className={s.adminContainer}>
      <h2>Адмін Панель</h2>
      <Bookings />
    </div>
  );
};

export default Admin;
