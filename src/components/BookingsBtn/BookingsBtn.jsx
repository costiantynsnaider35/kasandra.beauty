import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { checkAuthState } from "../../firebaseConfig";
import s from "./BookingsBtn.module.css";

const BookingsBtn = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthState((user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
  }, []);

  const handleBookingClick = () => {
    if (isAuthenticated) {
      navigate("/bookings");
    } else {
      navigate("/register");
    }
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
