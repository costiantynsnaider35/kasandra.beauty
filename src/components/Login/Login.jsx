import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../Firebase/firebaseConfig.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import s from "./Login.module.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [password, setPassword] = useState(
    localStorage.getItem("password") || ""
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const checkUserRole = useCallback(
    async (userId) => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          navigate("/admin");
        } else {
          navigate("/bookings");
        }
      } catch (error) {
        console.error("Помилка отримання ролі користувача: ", error);
        setError("Не вдалося отримати дані користувача.");
      }
    },
    [navigate]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkUserRole(user.uid);
      }
    });
    return () => unsubscribe();
  }, [checkUserRole]);

  useEffect(() => {
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);
  }, [email, password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      checkUserRole(userCredential.user.uid);
    } catch (error) {
      console.error("Помилка входу: ", error);
      setError("Неправильний email або пароль.");
    }
  };

  return (
    <div className={s.loginContainer}>
      <h2 className={s.loginTitle}>Вхід</h2>
      <form onSubmit={handleLogin} className={s.loginForm}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className={s.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className={s.eyeButton}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
          </button>
        </div>

        <button type="submit" className={s.loginButton}>
          Увійти
        </button>
      </form>
      {error && <p className={s.errorText}>{error}</p>}

      <p className={s.toggleLogin}>
        Не маєте акаунта?
        <button
          onClick={() => navigate("/register")}
          className={s.loginToggleButton}
        >
          Зареєструватись
        </button>
      </p>
    </div>
  );
};

export default Login;
