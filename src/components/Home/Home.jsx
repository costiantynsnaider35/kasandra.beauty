import s from "./Home.module.css";

const Home = () => {
  return (
    <div className={s.homePage}>
      <img
        className={s.homeImg}
        src="../../image/img/photo_2025-02-15_20-04-04 (1).jpg"
        alt="Kasandra Beauty"
      />
      <div className={s.homeTitle}>
        <div className={s.homeFancy1}>
          <span>K</span>ASANDRA
        </div>
        <div className={s.homeFancy2}>
          <span>B</span>EAUTY
        </div>
      </div>
      <p className={s.homeInfo}>
        Твоя особиста чарівниця у світі манікюру та педикюру!
      </p>
    </div>
  );
};
export default Home;
