import s from "./Developer.module.css";

const Developer = () => {
  return (
    <div className={s.developer}>
      <a
        href="https://t.me/Constantin89"
        target="_blank"
        rel="noopener noreferrer"
        className={s.developerLink}
      >
        <svg
          className={s.telegramIcon}
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M9.043 16.37l-.385 5.36c.552 0 .794-.238 1.086-.522l2.6-2.506 5.387 3.924c.99.546 1.69.26 1.955-.917l3.54-16.625h.001c.314-1.458-.53-2.027-1.487-1.684L1.6 10.064c-1.436.553-1.415 1.347-.25 1.708l5.572 1.742 12.938-8.15c.609-.404 1.163-.187.707.26L9.043 16.37z" />
        </svg>
        © 2025 Developer: KOSTIANTYN SHNAIDER
      </a>
    </div>
  );
};

export default Developer;
