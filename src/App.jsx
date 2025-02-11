import { Routes, Route } from "react-router-dom";
import AboutMe from "./pages/AboutMe/AboutMe";
import Booking from "./pages/Booking/Booking";
import DaySchedule from "./pages/DaySchedule/DaySchedule";
import Adminpanel from "./pages/AdminPanel/Adminpanel";
import Header from "./components/Header/Header";
import "./App.css";
import Loader from "./components/Loader/Loader";
import { Suspense } from "react";

function App() {
  return (
    <div className="app">
      <Header />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<AboutMe />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/schedule/:date" element={<DaySchedule />} />
          <Route path="/admin" element={<Adminpanel />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
