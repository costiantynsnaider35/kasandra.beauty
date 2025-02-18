import s from "./Loader.module.css";

const Loader = () => {
  return (
    <div className={s.loaderContainer}>
      <div className={s.loading}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default Loader;
