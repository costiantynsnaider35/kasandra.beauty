import { Routes, Route } from "react-router-dom";
import AboutMe from "./pages/AboutMe/AboutMe";
import Header from "./components/Header/Header";
import "./App.css";
import Loader from "./components/Loader/Loader";
import { Suspense } from "react";
import HomePage from "./pages/HomePage/HomePage";
import GalleryPage from "./pages/GalleryPage/GalleryPage";
import PricePage from "./pages/PricePage/PricePage";
import ContactsPage from "./pages/ContactsPage/ContactsPage";

function App() {
  return (
    <div className="app">
      <Header />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutMe />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/price" element={<PricePage />} />
          <Route path="/contacts" element={<ContactsPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
