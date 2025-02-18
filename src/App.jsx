import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "./components/Header/Layout";

const Loader = lazy(() => import("./components/Loader/Loader"));
const HomePage = lazy(() => import("./pages/HomePage/HomePage"));
const AboutMe = lazy(() => import("./pages/AboutMe/AboutMe"));
const GalleryPage = lazy(() => import("./pages/GalleryPage/GalleryPage"));
const PricePage = lazy(() => import("./pages/PricePage/PricePage"));
const ContactsPage = lazy(() => import("./pages/ContactsPage/ContactsPage"));
const BookingsPage = lazy(() => import("./pages/BookingsPage/BookingsPage"));

const routes = ["/", "/about", "/gallery", "/price", "/contacts", "/bookings"];

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
  stiffness: 200,
  damping: 20,
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (location.state?.direction !== undefined) {
      setDirection(location.state.direction);
    }
    setLoading(false);
  }, [location]);

  const handleDragStart = (event) => {
    const target = event.target;
    if (target.tagName === "IMG" || target.closest(".map-container")) {
      event.preventDefault();
    } else {
      dragStartRef.current = { x: event.clientX, y: event.clientY };
    }
  };

  const handleDragEnd = (_, { offset, velocity }) => {
    const currentIndex = routes.indexOf(location.pathname);
    const dragDistanceX = Math.abs(offset.x);
    const dragDistanceY = Math.abs(offset.y);

    if (dragDistanceY > dragDistanceX) {
      return;
    }

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
            {routes.map((path, index) => (
              <Route
                key={path}
                path={path}
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
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    {index === 0 && <HomePage />}
                    {index === 1 && <AboutMe />}
                    {index === 2 && <GalleryPage />}
                    {index === 3 && <PricePage />}
                    {index === 4 && <ContactsPage />}
                    {index === 5 && <BookingsPage />}
                  </motion.div>
                }
              />
            ))}
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}

export default App;
