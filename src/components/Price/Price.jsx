import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import s from "./Price.module.css";
import BookingsBtn from "../BookingsBtn/BookingsBtn";

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
      <BookingsBtn />
      {services.map((service, index) => (
        <div key={index}>
          <div
            className={s.priceContainer}
            onClick={() => toggleAccordion(index)}
          >
            <img src={service.image} alt={service.title} />
            <h2 className={s.priceTitle}>{service.title}</h2>
          </div>

          <AnimatePresence>
            {openIndex === index && (
              <motion.ul
                className={s.priceList}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {service.items.map((item, itemIndex) => (
                  <motion.li
                    key={itemIndex}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: itemIndex * 0.1 }}
                  >
                    <p>{item.description}</p>
                    <p>{item.price}</p>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default Price;
