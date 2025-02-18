import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import { lazy, Suspense, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "./components/Header/Layout";

const Loader = lazy(() => import("./components/Loader/Loader"));
const HomePage = lazy(() => import("./pages/HomePage/HomePage"));
const AboutMe = lazy(() => import("./pages/AboutMe/AboutMe"));
const GalleryPage = lazy(() => import("./pages/GalleryPage/GalleryPage"));
const PricePage = lazy(() => import("./pages/PricePage/PricePage"));
const ContactsPage = lazy(() => import("./pages/ContactsPage/ContactsPage"));

const routes = ["/", "/about", "/gallery", "/price", "/contacts"];

const pageVariants = {
  initial: (direction) => ({
    opacity: 0,
    x: direction > 0 ? "100vw" : "-100vw",
  }),
  enter: {
    opacity: 1,
    x: 0,
  },
  out: (direction) => ({
    opacity: 0,
    x: direction > 0 ? "-100vw" : "100vw",
  }),
};

const pageTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.direction !== undefined) {
      setDirection(location.state.direction);
    }
    setLoading(false);
  }, [location]);

  const handleDragEnd = (_, { offset, velocity }) => {
    const currentIndex = routes.indexOf(location.pathname);

    if (offset.x > 100 || velocity.x > 2) {
      const prevIndex = (currentIndex - 1 + routes.length) % routes.length;
      setDirection(-1);
      navigate(routes[prevIndex], { state: { direction: -1 } });
    } else if (offset.x < -100 || velocity.x < -2) {
      const nextIndex = (currentIndex + 1) % routes.length;
      setDirection(1);
      navigate(routes[nextIndex], { state: { direction: 1 } });
    }
  };

  return (
    <div className={`app ${loading ? "loading" : ""}`}>
      <Layout setDirection={setDirection} />
      <Suspense fallback={<Loader />}>
        <AnimatePresence mode="wait" custom={direction}>
          <Routes location={location} key={location.key}>
            <Route
              path="/"
              element={
                <motion.div
                  custom={direction}
                  initial="initial"
                  animate="enter"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd}
                >
                  <HomePage />
                </motion.div>
              }
            />
            <Route
              path="/about"
              element={
                <motion.div
                  custom={direction}
                  initial="initial"
                  animate="enter"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd}
                >
                  <AboutMe />
                </motion.div>
              }
            />
            <Route
              path="/gallery"
              element={
                <motion.div
                  custom={direction}
                  initial="initial"
                  animate="enter"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd}
                >
                  <GalleryPage />
                </motion.div>
              }
            />
            <Route
              path="/price"
              element={
                <motion.div
                  custom={direction}
                  initial="initial"
                  animate="enter"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd}
                >
                  <PricePage />
                </motion.div>
              }
            />
            <Route
              path="/contacts"
              element={
                <motion.div
                  custom={direction}
                  initial="initial"
                  animate="enter"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd}
                >
                  <ContactsPage />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}

export default App;
