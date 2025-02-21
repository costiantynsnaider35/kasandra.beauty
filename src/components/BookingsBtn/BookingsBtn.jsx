import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { checkAuthState, getUserRole } from "../../Firebase/firebaseService.js";
import s from "./BookingsBtn.module.css";

const BookingsBtn = () => {
  const navigate = useNavigate();
  const [route, setRoute] = useState("/register");

  useEffect(() => {
    const unsubscribe = checkAuthState(async (user) => {
      if (!user) return setRoute("/register");

      const role = await getUserRole(user.uid);
      setRoute(role === "admin" ? "/admin" : "/bookings");
    });

    return unsubscribe;
  }, []);

  return (
    <button className={s.bookingsBtn} onClick={() => navigate(route)}>
      <span>Натисни, щоб записатись!</span>
    </button>
  );
};

export default BookingsBtn;
