import s from "./Logo.module.css";

const Logo = () => {
  return (
    <div className={s.logo}>
      <img src="/src/assets/Logo.jpg" alt="Logo" />
    </div>
  );
};

export default Logo;
