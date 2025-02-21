import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../Firebase/firebaseConfig.js";
import s from "./Logout.module.css";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Помилка виходу: ", error);
    }
  };

  return (
    <button onClick={handleLogout} className={s.logoutBtn}>
      Вийти
    </button>
  );
};

export default Logout;
