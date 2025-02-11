import CommentSection from "../../components/CommentSection/CommentSection";
import ContactSection from "../../components/ContactSection/ContactSection";
import GallerySection from "../../components/GallerySection/GallerySection";
import InfoSection from "../../components/InfoSection/InfoSection";
import s from "./AboutMe.module.css";

const AboutMe = () => {
  return (
    <div className={s.about}>
      <InfoSection />
      <GallerySection />
      <CommentSection />
      <ContactSection />
    </div>
  );
};

export default AboutMe;
