import { Outlet } from "react-router-dom";
import Header from "./Header";
import s from "./Layout.module.css";

const Layout = ({ setDirection }) => {
  return (
    <div className={s.layoutContainer}>
      <Header setDirection={setDirection} />
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
