import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/uk";
import s from "./DayUserBookings.module.css";
import {
  getBookingsByDate,
  addBooking,
} from "../../Firebase/firebaseBookings.js";

const proceduresList = [
  {
    category: "Манікюр",
    options: [
      "зняття від іншого майстра",
      "корекція 1-го нігтя",
      "френч",
      "без покриття",
      "з покриттям",
      "корекція нарощених нігтів",
      "нарощування",
      "арт френч",
      "чоловічий",
    ],
  },
  {
    category: "Педикюр",
    options: ["чищення", "подологічний", "з покриттям", "чоловічий"],
  },
  { category: "Брови", options: ["корекція воском", "корекція з фарбуванням"] },
];

const DayUserBookings = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const selectedDate = date ? dayjs(date) : dayjs();
  const formattedDate = selectedDate.format("YYYY-MM-DD");
  const displayDate = selectedDate.format("D MMMM");

  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    procedures: [],
    time: "",
    comment: "",
  });

  useEffect(() => {
    const fetchBookings = async () => {
      const data = await getBookingsByDate(formattedDate);
      setBookings(data);
    };

    fetchBookings();
  }, [formattedDate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      procedures: checked
        ? [...prevState.procedures, value]
        : prevState.procedures.filter((proc) => proc !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.fullName ||
      !formData.phoneNumber ||
      formData.procedures.length === 0 ||
      !formData.time
    ) {
      alert("Заповніть всі обов’язкові поля!");
      return;
    }

    const newBooking = {
      ...formData,
      date: formattedDate,
    };

    const addedBooking = await addBooking(newBooking);
    if (addedBooking) {
      setBookings([...bookings, addedBooking]);
      setFormData({
        fullName: "",
        phoneNumber: "",
        procedures: [],
        time: "",
        comment: "",
      });
    }
  };

  return (
    <div className={s.container}>
      <h2>Записи на {displayDate}</h2>

      {bookings.length > 0 ? (
        <ol>
          {bookings.map((booking) => (
            <li key={booking.id}>{booking.time}</li>
          ))}
        </ol>
      ) : (
        <p>Немає записів</p>
      )}

      <form className={s.form} onSubmit={handleSubmit}>
        <label className={s.formLabel}>
          Ім’я та прізвище*:
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className={s.formInput}
          />
        </label>

        <label className={s.formLabel}>
          Номер телефону*:
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className={s.formInput}
          />
        </label>

        <fieldset>
          <legend>Процедури*:</legend>
          {proceduresList.map((category) => (
            <div key={category.category} className={s.procedureCategory}>
              <strong className={s.categoryProc}>{category.category}</strong>
              {category.options.map((option) => (
                <label key={option} className={s.procedureItem}>
                  <input
                    type="checkbox"
                    name="procedures"
                    value={option}
                    checked={formData.procedures.includes(option)}
                    onChange={handleCheckboxChange}
                    className={s.procedureCheckbox}
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}
        </fieldset>

        <label className={s.timeLabel}>
          Час*:
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className={s.timeInput}
          />
        </label>

        <label className={s.comLabel}>
          Коментар:
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            className={s.comInput}
          ></textarea>
        </label>

        <button className={s.addBtn} type="submit">
          Записатися
        </button>
      </form>

      <button className={s.backButton} onClick={() => navigate(-1)}>
        Назад
      </button>
    </div>
  );
};

export default DayUserBookings;
