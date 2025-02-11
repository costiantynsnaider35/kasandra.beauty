import clsx from "clsx";
import { NavLink } from "react-router-dom";
import s from "./Header.module.css";
import Logo from "../Logo/Logo";

const Header = () => {
  const buildLinkClass = ({ isActive }) => {
    return clsx(s.link, isActive && s.activeLink);
  };

  return (
    <div className={s.header}>
      <Logo />
      <NavLink className={buildLinkClass} to="/">
        Про мене
      </NavLink>
      <NavLink className={buildLinkClass} to="/booking">
        Записатись
      </NavLink>
    </div>
  );
};

export default Header;
