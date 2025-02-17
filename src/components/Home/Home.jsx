import s from "./Home.module.css";

const Home = () => {
  return (
    <div className={s.homePage}>
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
