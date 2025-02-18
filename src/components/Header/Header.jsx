import clsx from "clsx";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import s from "./Header.module.css";
import { IoIosHome } from "react-icons/io";

const routes = ["/", "/about", "/gallery", "/price", "/contacts"];

const Header = ({ setDirection }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const buildLinkClass = ({ isActive }) => {
    return clsx(s.link, isActive && s.activeLink);
  };

  const handleLinkClick = (path) => {
    const currentIndex = routes.indexOf(location.pathname);
    const targetIndex = routes.indexOf(path);
    const direction = targetIndex > currentIndex ? 1 : -1;
    setDirection(direction);
    navigate(path, { state: { direction } });
  };

  return (
    <div className={s.header}>
      <NavLink
        className={buildLinkClass}
        to="/"
        onClick={() => handleLinkClick("/")}
      >
        <IoIosHome width={23} height={23} />
      </NavLink>
      <NavLink
        className={buildLinkClass}
        to="/about"
        onClick={() => handleLinkClick("/about")}
      >
        Про мене
      </NavLink>
      <NavLink
        className={buildLinkClass}
        to="/gallery"
        onClick={() => handleLinkClick("/gallery")}
      >
        Мої роботи
      </NavLink>
      <NavLink
        className={buildLinkClass}
        to="/price"
        onClick={() => handleLinkClick("/price")}
      >
        Прайс
      </NavLink>
      <NavLink
        className={buildLinkClass}
        to="/contacts"
        onClick={() => handleLinkClick("/contacts")}
      >
        Контакти
      </NavLink>
    </div>
  );
};

export default Header;
