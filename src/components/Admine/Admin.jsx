import BookingsAdmine from "../BookingsAdmine/BookingsAdmine";
import s from "./Admin.module.css";

const Admin = () => {
  return (
    <div className={s.adminContainer}>
      <h2>Адмін Панель</h2>
      <BookingsAdmine />
    </div>
  );
};

export default Admin;
