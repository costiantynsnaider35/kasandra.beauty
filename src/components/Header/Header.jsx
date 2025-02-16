import clsx from "clsx";
import { NavLink } from "react-router-dom";
import s from "./Header.module.css";
import { IoIosHome } from "react-icons/io";

const Header = () => {
  const buildLinkClass = ({ isActive }) => {
    return clsx(s.link, isActive && s.activeLink);
  };

  return (
    <div className={s.header}>
      <NavLink className={buildLinkClass} to="/">
        <IoIosHome width={23} height={23} />
      </NavLink>
      <NavLink className={buildLinkClass} to="/about">
        Про мене
      </NavLink>
      <NavLink className={buildLinkClass} to="/gallery">
        Мої роботи
      </NavLink>
      <NavLink className={buildLinkClass} to="/price">
        Прайс
      </NavLink>
      <NavLink className={buildLinkClass} to="/contacts">
        Контакти
      </NavLink>
    </div>
  );
};

export default Header;
