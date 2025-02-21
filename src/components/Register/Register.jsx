import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../Firebase/firebaseService.js";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import s from "./Register.module.css";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const validateEmail = (email) => {
    if (!email) {
      setEmailError("Поле обов'язкове");
      return false;
    }
    if (!email.includes("@")) {
      setEmailError("Email повинен містити @");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError("Поле обов'язкове");
      return false;
    }

    const passwordRegex = /^[A-Z][a-zA-Z0-9!@#$%^&*]*[0-9]+[!@#$%^&*]+$/;

    if (!passwordRegex.test(password) || password.length < 5) {
      setPasswordError(
        "Пароль має починатися з великої літери, містити мінімум 5 символи, хоча б 1 цифру і хоча б 1 спецсимвол (!@#$%^&*)"
      );
      return false;
    }

    setPasswordError("");
    return true;
  };

  useEffect(() => {
    setIsFormValid(validateEmail(email) && validatePassword(password));
  }, [email, password]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isFormValid) {
      setLoading(false);
      return;
    }

    try {
      const redirectPath = await registerUser(email, password);
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || "Сталася невідома помилка!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.registerContainer}>
      <h2 className={s.registerTitle}>Реєстрація</h2>
      <form onSubmit={handleRegister} className={s.registerForm}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {emailError && <p className={s.errorText}>{emailError}</p>}

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
        {passwordError && <p className={s.errorText}>{passwordError}</p>}

        <button
          type="submit"
          className={s.registerButton}
          disabled={!isFormValid || loading}
        >
          {loading ? "Реєстрація..." : "Зареєструватися"}
        </button>
      </form>

      {error && <p className={s.errorText}>{error}</p>}

      <p className={s.toggleRegister}>
        Вже маєте акаунт?
        <button onClick={() => navigate("/login")} className={s.toggleButton}>
          Увійти
        </button>
      </p>
    </div>
  );
};

export default Register;
