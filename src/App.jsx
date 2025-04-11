import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import { lazy, Suspense, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";

const Loader = lazy(() => import("./components/Loader/Loader"));
const Layout = lazy(() => import("./components/Header/Layout"));
const HomePage = lazy(() => import("./pages/HomePage/HomePage"));
const AboutMe = lazy(() => import("./pages/AboutMe/AboutMe"));
const GalleryPage = lazy(() => import("./pages/GalleryPage/GalleryPage"));
const PricePage = lazy(() => import("./pages/PricePage/PricePage"));
const ContactsPage = lazy(() => import("./pages/ContactsPage/ContactsPage"));
const BookingsPage = lazy(() => import("./pages/BookingsPage/BookingsPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage/RegisterPage"));
const LoginPage = lazy(() => import("./pages/LoginPage/LoginPage"));
const AdminPage = lazy(() => import("./pages/AdminPage/AdminPage"));
const DayPage = lazy(() => import("./pages/DayPage/DayPage"));
const DayUserPage = lazy(() => import("./pages/DayUserPage/DayUserPage"));

const routeComponents = {
  "/": HomePage,
  "/about": AboutMe,
  "/gallery": GalleryPage,
  "/price": PricePage,
  "/contacts": ContactsPage,
  "/bookings": BookingsPage,
  "/bookings/day/:date": DayUserPage,
  "/register": RegisterPage,
  "/login": LoginPage,
  "/admin": AdminPage,
  "/admin/day/:date": DayPage,
};

const routes = Object.keys(routeComponents);

const pageVariants = {
  initial: (direction) => ({
    opacity: 0,
    x: direction > 0 ? "100vw" : "-100vw",
  }),
  enter: { opacity: 1, x: 0 },
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

const App = () => {
  const location = useLocation();
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.direction !== undefined) {
      setDirection(location.state.direction);
    }
    setLoading(false);
  }, [location]);

  return (
    <div className={`app ${loading ? "loading" : ""}`}>
      <Toaster position="top-center" />
      <Layout setDirection={setDirection} />
      <Suspense fallback={<Loader />}>
        <AnimatePresence mode="wait" custom={direction}>
          <Routes location={location} key={location.key}>
            {routes.map((path) => {
              const Component = routeComponents[path];
              return (
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
                    >
                      <Component />
                    </motion.div>
                  }
                />
              );
            })}
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  );
};

export default App;
