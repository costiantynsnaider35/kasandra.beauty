import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../Firebase/firebaseConfig.js";
import s from "./Logout.module.css";

const Logout = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch {
      setErrorMessage("Помилка виходу. Будь ласка, спробуйте знову.");
    }
  };

  return (
    <div>
      <button onClick={handleLogout} className={s.logoutBtn}>
        Вийти
      </button>
      {errorMessage && <p className={s.error}>{errorMessage}</p>}
    </div>
  );
};

export default Logout;
