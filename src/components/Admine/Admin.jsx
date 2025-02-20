import { useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import Bookings from "../Bookings/Bookings";
import s from "./Admin.module.css";
import { auth, db } from "../../firebaseConfig";

const Admin = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleAssignAdmin = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      setMessage("Вы должны быть авторизованы.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      const isAdminEmail = user.email === "constantin161089@gmail.com"; // Замените на ваш email

      if (userDoc.exists() && userDoc.data().role === "admin" && isAdminEmail) {
        const targetUserDocRef = doc(db, "users", email);
        await updateDoc(targetUserDocRef, {
          role: "admin",
        });
        setMessage(`Пользователь ${email} назначен администратором.`);
      } else {
        setMessage("У вас нет прав для назначения администратора.");
      }
    } catch (error) {
      console.error("Ошибка при назначении администратора: ", error);
      setMessage("Ошибка при назначении администратора.");
    }
  };

  return (
    <div className={s.adminContainer}>
      <h2>Адмін Панель</h2>
      <p>Ласкаво просимо до панелі адміністратора!</p>
      <Bookings />
      <form onSubmit={handleAssignAdmin} className={s.adminForm}>
        <input
          type="email"
          placeholder="Email пользователя"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className={s.assignButton}>
          Назначить администратором
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Admin;
