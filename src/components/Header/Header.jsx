import clsx from "clsx";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import s from "./Header.module.css";
import { IoIosHome } from "react-icons/io";

const routes = ["/", "/about", "/gallery", "/price", "/contacts"];

const Header = ({ setDirection }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const buildLinkClass = ({ isActive }) =>
    clsx(s.link, isActive && s.activeLink);

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
      {routes.slice(1).map((route) => (
        <NavLink
          key={route}
          className={buildLinkClass}
          to={route}
          onClick={() => handleLinkClick(route)}
        >
          {route === "/about" && "Про мене"}
          {route === "/gallery" && "Мої роботи"}
          {route === "/price" && "Прайс"}
          {route === "/contacts" && "Контакти"}
        </NavLink>
      ))}
    </div>
  );
};

export default Header;
