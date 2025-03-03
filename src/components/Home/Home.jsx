import BookingsBtn from "../BookingsBtn/BookingsBtn";
import s from "./Home.module.css";

const Home = () => {
  return (
    <div className={s.homePage}>
      <BookingsBtn />
      <div className={s.homeTitle}>
        <div className={s.homeFancy1}>
          <span>K</span>ASANDRA
        </div>
        <div className={s.homeFancy2}>
          <span>B</span>EAUTY
        </div>
      </div>
    </div>
  );
};

export default Home;
