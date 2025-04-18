import BookingsBtn from "../BookingsBtn/BookingsBtn";
import Map from "../Map/Map";
import s from "./Contacts.module.css";
import InstagramIcon from "/svg/icons8-instagram.svg";
import ViberIcon from "/svg/icons8-viber.svg";

const Contacts = () => (
  <div className={s.contacts}>
    <BookingsBtn />
    <div className={s.contactsSocial}>
      <h2 className={s.contactsTitle}>Контактні данні</h2>
      <div className={s.contactsList}>
        <a
          className={s.contactsIcon}
          href="https://www.instagram.com/kasandra.beauty/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={InstagramIcon} alt="Instagram" className={s.icon} />
          <span>@kasandra.beauty</span>
        </a>
        <a
          className={s.contactsIcon}
          href="viber://chat?number=+380933244559"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={ViberIcon} alt="Viber" className={s.icon} />
          <span>+380 93 324 4559</span>
        </a>
      </div>
    </div>
    <div className={s.contactsAddress}>
      <h2 className={s.contactsTitle}>Адреса:</h2>
      <p className={s.contactsItem}>
        Одеса, БЦ &quot;Парк&quot;, вул. Академіка Корольова, 92a, 2-й поверх,
        кабінет N204
      </p>
    </div>
    <Map />
  </div>
);

export default Contacts;
