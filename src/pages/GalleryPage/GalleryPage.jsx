import { useState } from "react";
import Modal from "react-modal";
import s from "./GalleryPage.module.css";

Modal.setAppElement("#root");

const GalleryPage = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentImgSrc, setCurrentImgSrc] = useState("");

  const openModal = (src) => {
    setCurrentImgSrc(src);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentImgSrc("");
  };

  return (
    <div className={s.galleryPage}>
      <ul className={s.galleryList}>
        {[...Array(12).keys()].map((index) => (
          <li key={index} className={s.galleryItem}>
            <img
              src={`/src/assets/img/n${index + 1}.jpg`}
              alt={`nails${index + 1}`}
              onClick={() => openModal(`/src/assets/img/n${index + 1}.jpg`)}
            />
          </li>
        ))}
      </ul>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className={s.modalContent}
        overlayClassName={s.modalOverlay}
      >
        {currentImgSrc && (
          <img
            src={currentImgSrc}
            alt="Modal Content"
            className={s.modalImage}
          />
        )}
      </Modal>
    </div>
  );
};

export default GalleryPage;
