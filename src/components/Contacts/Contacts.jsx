import Map from "../Map/Map";
import s from "./Contacts.module.css";
import InstagramIcon from "../../assets/svg/icons8-instagram.svg";
import ViberIcon from "../../assets/svg/icons8-viber.svg";

const Contacts = () => {
  return (
    <div className={s.contacts}>
      <div className={s.contactsAddress}>
        <h2 className={s.contactsTitle}>Адреса:</h2>
        <p className={s.contactsItem}>
          БЦ &quot;Парк&quot;, вул. Академіка Корольова, 92a, Одеса
        </p>
      </div>
      <Map />
      <div className={s.contactsSocial}>
        <h2 className={s.contactsTitle}>Контактні данні</h2>
        <div className={s.contactsList}>
          <div className={s.contactsIcon}>
            <a
              href="https://www.instagram.com/kasandra.beauty/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={InstagramIcon} alt="Instagram" className={s.icon} />
            </a>
            <span>@kasandra.beauty</span>
          </div>
          <div className={s.contactsIcon}>
            <a
              href="viber://chat?number=+380933244559"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={ViberIcon} alt="Viber" className={s.icon} />
            </a>
            <span>+380 93 324 4559</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
