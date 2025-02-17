import { useState } from "react";
import s from "./Price.module.css";

const Price = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const services = [
    {
      title: "Манікюр",
      image: "/img/man.jpg",
      items: [
        { description: "з покриттям", price: "700грн" },
        { description: "без покриття", price: "350грн" },
        { description: "зняття іншого майстра", price: "50грн" },
        { description: "чоловічий", price: "450грн" },
        { description: "нарощування", price: "1000грн" },
        { description: "корекція нарощених нігтів", price: "800грн" },
        { description: "френч", price: "100грн" },
        {
          description: (
            <span>(*дизайн 2-х,4-х нігтів, як комплімент від майстра!)</span>
          ),
        },
      ],
    },
    {
      title: "Педикюр",
      image: "/img/ped.jpg",
      items: [
        { description: "звичайний", price: "750грн" },
        { description: "чищення", price: "450грн" },
        { description: "чоловічий", price: "600грн" },
        { description: "подологічний", price: "600грн" },
      ],
    },
    {
      title: "Брови",
      image: "/img/br.jpg",
      items: [
        { description: "корекція воском", price: "250грн" },
        { description: "корекція з фарбуванням", price: "400грн" },
      ],
    },
  ];

  return (
    <div className={s.price}>
      {services.map((service, index) => (
        <div className={s.priceContainer} key={index}>
          <img src={service.image} alt={service.title} />
          <h2 className={s.priceTitle} onClick={() => toggleAccordion(index)}>
            {service.title}
          </h2>
          {openIndex === index && (
            <ul className={s.priceList}>
              {service.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <p>{item.description}</p>
                  <p>{item.price}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default Price;
