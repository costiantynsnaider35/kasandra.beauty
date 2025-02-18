import { useNavigate } from "react-router-dom";
import s from "./BookingsBtn.module.css";

const BookingsBtn = () => {
  const navigate = useNavigate();

  const handleBookingClick = () => {
    navigate("/bookings");
  };

  return (
    <div>
      <button className={s.bookingsBtn} onClick={handleBookingClick}>
        <span>Натисни, щоб записатись!</span>
      </button>
    </div>
  );
};
export default BookingsBtn;
