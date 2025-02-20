import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { checkAuthState } from "../../firebaseConfig";
import s from "./Register.module.css";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(true);

  useEffect(() => {
    checkAuthState(async (user) => {
      if (user) {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          navigate("/admin");
        } else {
          navigate("/bookings");
        }
      }
    });
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const db = getFirestore();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const isAdminEmail = email === "constantin161089@gmail.com";

      await setDoc(doc(db, "users", user.uid), {
        email,
        role: isAdminEmail ? "admin" : "user",
      });

      navigate(isAdminEmail ? "/admin" : "/bookings");
    } catch (error) {
      console.error("Error registering user: ", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const db = getFirestore();
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        navigate("/admin");
      } else {
        navigate("/bookings");
      }
    } catch (error) {
      console.error("Error logging in user: ", error);
    }
  };

  return (
    <div className={s.registerContainer}>
      <h2>{isRegistering ? "Зареєструватись" : "Увійти"}</h2>
      <form
        onSubmit={isRegistering ? handleRegister : handleLogin}
        className={s.registerForm}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className={s.registerButton}>
          {isRegistering ? "Зареєструватись" : "Увійти"}
        </button>
      </form>
      <button
        onClick={() => setIsRegistering(!isRegistering)}
        className={s.toggleButton}
      >
        {isRegistering ? "Увійти" : "Зареєструватись"}
      </button>
    </div>
  );
};

export default Register;
