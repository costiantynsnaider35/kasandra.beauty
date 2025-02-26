import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const today = dayjs().format("YYYY-MM-DD");
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
      const data = await getBookingsByDate(today);
      setBookings(data);
    };

    fetchBookings();
  }, [today]);

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
      date: today,
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
      <h2>Записи на сьогодні</h2>

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
        <label>
          Ім’я та прізвище*:
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Номер телефону*:
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </label>

        <fieldset>
          <legend>Процедури*:</legend>
          {proceduresList.map((category) => (
            <div key={category.category}>
              <strong>{category.category}</strong>
              {category.options.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    name="procedures"
                    value={option}
                    checked={formData.procedures.includes(option)}
                    onChange={handleCheckboxChange}
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}
        </fieldset>

        <label>
          Час*:
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Коментар:
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
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
