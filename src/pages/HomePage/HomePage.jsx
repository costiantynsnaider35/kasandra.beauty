import s from "./HomePage.module.css";

const HomePage = () => {
  return (
    <div className={s.homePage}>
      <h1 className={s.homeTitle}>Kasandra Beauty</h1>
      <img
        className={s.homeImg}
        src="/src/assets/img/photo_2025-02-15_20-04-04 (1).jpg"
        alt="Kasandra Beauty"
      />
      <p>Твоя особиста чарівниця у світі манікюру та педикюру</p>
    </div>
  );
};

export default HomePage;
